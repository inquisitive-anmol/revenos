import { Worker, Job } from "bullmq";
import { redis } from "../config/redis";
import { BookerAgent } from "@revenos/agents";
import { Lead, Meeting, Campaign, AgentLog, Agent } from "@revenos/db";
import { getNylasClient } from "../config/nylas";

export interface BookerJobData {
  workspaceId: string;
  campaignId: string;
  leadId: string;
}

export const bookerWorker = new Worker<BookerJobData>(
  "booker",
  async (job: Job<BookerJobData>) => {
    const { workspaceId, campaignId, leadId } = job.data;

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

    // 4. Run booker agent
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
        fromEmail: process.env.FROM_EMAIL!,
        fromName: process.env.FROM_NAME!,
      },
      calendar: {
        grantId: process.env.NYLAS_GRANT_ID!,
        meetingDuration: 30,
        timezone: "Asia/Kolkata",
      },
    });

    // 5. Save meeting to MongoDB
    if (result.meetingBooked && result.calendarEventId) {
      await Meeting.create({
        workspaceId,
        leadId: lead._id,
        campaignId,
        calendarEventId: result.calendarEventId,
        scheduledAt: result.scheduledAt,
      });

      // 6. Update lead status
      await Lead.findOneAndUpdate(
        { _id: leadId, workspaceId },
        { status: "meeting_booked" }
      );

      // 7. Update campaign metrics
      await Campaign.findOneAndUpdate(
        { _id: campaignId, workspaceId },
        { $inc: { "metrics.meetingsBooked": 1 } }
      );

      // 8. Log completion
      await AgentLog.create({
        workspaceId,
        agentId: agent._id,
        campaignId,
        event: "booker.meeting_booked",
        data: {
          leadId,
          calendarEventId: result.calendarEventId,
          scheduledAt: result.scheduledAt,
        },
        timestamp: new Date(),
      });
    }

    console.log(
      `[BookerJob] Completed. Meeting booked for ${lead.email} ✅`
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