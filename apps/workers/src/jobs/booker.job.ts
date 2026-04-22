import { Worker, Job } from "bullmq";
import { redis } from "../config/redis";
import { BookerAgent } from "@revenos/agents";
import { Lead, Meeting, Campaign, AgentLog, Agent, EmailThread, Workspace } from "@revenos/db";
import { getNylasClient } from "../config/nylas";
import { deductCredits, InsufficientCreditsError, CREDIT_COSTS } from "@revenos/billing";
import { bookerQueue } from "@revenos/queue";

export interface BookerJobData {
  workspaceId: string;
  campaignId: string;
  leadId: string;
}

export const bookerWorker = new Worker<BookerJobData>(
  "booker",
  async (job: Job<BookerJobData>) => {
    const { workspaceId, campaignId, leadId } = job.data;

    if (leadId) {
        const leadCheck = await Lead.findOne({ _id: leadId, workspaceId }).lean();
        if (leadCheck?.humanControlled) {
            console.log(`[BookerWorker] Lead ${leadId} under human control. Snoozing job ${job.name} for 30m.`);
            await bookerQueue.add(job.name, job.data, { delay: 30 * 60 * 1000, jobId: `${job.opts?.jobId ?? job.id}-retried-${Date.now()}` });
            return;
        }
    }

    console.log(`[BookerJob] Starting job ${job.id} for lead ${leadId}`);

    // 1. Fetch lead
    const lead = await Lead.findOne({ _id: leadId, workspaceId });
    if (!lead) throw new Error(`Lead ${leadId} not found`);

    // 2. Get or create booker agent
    let agent = await Agent.findOne({ workspaceId, type: "booker" });
    if (!agent) {
      agent = await Agent.create({
        workspaceId,
        type: "booker",
        config: {
          icpDescription: "",
          emailTone: "professional",
          followUpDays: [0, 3, 7],
          qualificationThreshold: 7,
        },
        status: "idle",
      });
    }

    // 3. Initialize booker agent
    const nylasClient = getNylasClient();
    const bookerAgent = new BookerAgent(
      {
        workspaceId,
        campaignId,
        agentId: agent._id.toString(),
        config: {
          icpDescription: "",
          emailTone: "professional",
          followUpDays: [0, 3, 7],
          qualificationThreshold: 7,
        },
      },
      nylasClient
    );

    // 4. Fetch workspace to get per-tenant Nylas credentials
    const workspace = await Workspace.findOne({ _id: workspaceId }).lean();
    const calendarGrantId = workspace?.integrations?.calendar?.nylasGrantId
      ?? process.env.NYLAS_GRANT_ID; // fallback to env for dev/testing

    if (!calendarGrantId) {
      throw new Error(
        `[BookerJob] No calendar integration found for workspace ${workspaceId}. ` +
        `User must connect their calendar in Settings → Integrations.`
      );
    }

    const fromEmail = process.env.FROM_EMAIL!;
    const fromName = process.env.FROM_NAME!;

    // 5. Run Phase 1 — fetch slots + send slot picker email (does NOT book)
    const result = await bookerAgent.run({
      leadId,
      workspaceId,
      campaignId,
      lead: {
        email: lead.email,
        firstName: lead.firstName,
        lastName: lead.lastName,
        company: lead.company,
        title: lead.title,
      },
      emailConfig: {
        fromEmail,
        fromName,
      },
      calendar: {
        grantId: calendarGrantId,
        meetingDuration: 30,
        timezone: workspace?.settings?.timezone ?? "Asia/Kolkata",
      },
    });

    try {
      await deductCredits(
        workspaceId,
        CREDIT_COSTS.AI_AGENT_RUN,
        "AI_AGENT_RUN",
        leadId
      );
    } catch (err) {
      if (err instanceof InsufficientCreditsError) {
        console.warn(`[BookerJob] Insufficient credits for workspace ${workspaceId}`);
      } else {
        throw err;
      }
    }

    try {
      await deductCredits(
        workspaceId,
        CREDIT_COSTS.EMAIL_SENT,
        "EMAIL_SENT",
        result.threadId // Use threadId since this initiates the email thread
      );
    } catch (err) {
      if (err instanceof InsufficientCreditsError) {
        console.warn(`[BookerJob] Insufficient credits for workspace ${workspaceId}`);
      } else {
        throw err;
      }
    }

    // 5. Save proposedSlots + bookerMeta on the EmailThread so
    //    the webhook handler can run Phase 2 when the lead replies
    const db = EmailThread.db;
    const rawCollection = db.collection("emailthreads");

    const updateResult = await rawCollection.updateOne(
      { externalThreadId: result.threadId },
      {
        $set: {
          status: "awaiting_slot_reply",
          proposedSlots: result.proposedSlots.map((s) => ({
            start: new Date(s.startTime * 1000).toISOString(),
            end: new Date(s.endTime * 1000).toISOString(),
            startFormatted: s.startTimeFormatted,
            endFormatted: s.endTimeFormatted,
          })),
          bookerMeta: {
            leadEmail: lead.email,
            leadName: `${lead.firstName} ${lead.lastName}`,
            calendarId: "primary",
            durationMins: 30,
          },
        },
      }
    );

    if (updateResult.matchedCount === 0) {
      // Thread may not exist yet if sendEmail creates it async — create it
      await rawCollection.insertOne({
        workspaceId,
        leadId: lead._id,
        campaignId,
        externalThreadId: result.threadId,
        messages: [],
        status: "awaiting_slot_reply",
        proposedSlots: result.proposedSlots.map((s) => ({
          start: new Date(s.startTime * 1000).toISOString(),
          end: new Date(s.endTime * 1000).toISOString(),
          startFormatted: s.startTimeFormatted,
          endFormatted: s.endTimeFormatted,
        })),
        bookerMeta: {
          leadEmail: lead.email,
          leadName: `${lead.firstName} ${lead.lastName}`,
          calendarId: "primary",
          durationMins: 30,
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      console.log(`[BookerJob] EmailThread not found for threadId ${result.threadId}, created new one`);
    }

    // 6. Update lead status to reflect slots have been sent
    await Lead.findOneAndUpdate(
      { _id: leadId, workspaceId },
      { status: "slots_sent" }
    );

    // 7. Update campaign metrics
    await Campaign.findOneAndUpdate(
      { _id: campaignId, workspaceId },
      { $inc: { "metrics.slotsSent": 1 } }
    );

    // 8. Log completion
    await AgentLog.create({
      workspaceId,
      agentId: agent._id,
      campaignId,
      event: "booker.slots_sent",
      data: {
        leadId,
        threadId: result.threadId,
        slotsOffered: result.proposedSlots.length,
      },
      timestamp: new Date(),
    });

    console.log(
      `[BookerJob] Completed. Slot picker sent to ${lead.email} ✅`
    );

    return result;
  },
  { connection: redis }
);

bookerWorker.on("completed", (job) => {
  console.log(`[BookerWorker] Job ${job.id} completed`);
});

bookerWorker.on("failed", (job, err) => {
  console.error(`[BookerWorker] Job ${job?.id} failed:`, err.message);
});