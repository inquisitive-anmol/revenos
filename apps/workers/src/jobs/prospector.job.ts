import { Worker, Job } from "bullmq";
import { redis } from "../config/redis";
import { ProspectorAgent } from "@revenos/agents";
import { Lead, Campaign, AgentLog } from "@revenos/db";
import { ProspectorInput } from "@revenos/agents";
import { deductCredits, InsufficientCreditsError, CREDIT_COSTS } from "@revenos/billing";

export interface ProspectorJobData {
  workspaceId: string;
  campaignId: string;
  agentId: string;
  icpDescription: string;
  leads: ProspectorInput["leads"];
}

export const prospectorWorker = new Worker<ProspectorJobData>(
  "prospector",
  async (job: Job<ProspectorJobData>) => {
    const {
      workspaceId,
      campaignId,
      agentId,
      icpDescription,
      leads,
    } = job.data;

    console.log(`[ProspectorJob] Starting job ${job.id}`);

    // 1. Initialize agent
    const agent = new ProspectorAgent({
      workspaceId,
      campaignId,
      agentId,
      config: {
        icpDescription,
        emailTone: "professional",
        followUpDays: [0, 3, 7],
        qualificationThreshold: 7,
      },
    });

    // 2. Run agent
    const result = await agent.run({
      icpDescription,
      campaignId,
      workspaceId,
      leads,
    });

    try {
      await deductCredits(
        workspaceId,
        CREDIT_COSTS.AI_AGENT_RUN,
        "AI_AGENT_RUN",
        campaignId
      );
    } catch (err) {
      if (err instanceof InsufficientCreditsError) {
        console.warn(`[ProspectorJob] Insufficient credits for workspace ${workspaceId}`);
      } else {
        throw err;
      }
    }


    // 3. Save enriched leads to MongoDB
    const savedLeads = await Promise.all(
      result.enrichedLeads.map((enrichedLead) =>
        Lead.findOneAndUpdate(
          { email: enrichedLead.email, campaignId, workspaceId },
          {
            $setOnInsert: {
              workspaceId,
              campaignId,
              email: enrichedLead.email,
              firstName: enrichedLead.firstName,
              lastName: enrichedLead.lastName,
              company: enrichedLead.company,
              title: enrichedLead.title,
              linkedinUrl: enrichedLead.linkedinUrl ?? undefined,
              companySize: enrichedLead.companySize ?? undefined,
              industry: enrichedLead.industry ?? undefined,
              icpScore: enrichedLead.icpScore,
              researchNotes: enrichedLead.researchNotes,
              status: "prospecting",
              enrichmentData: {},
              tags: [],
            }
          },
          { upsert: true, new: true, setDefaultsOnInsert: true }
        )
      )
    );

    // 4. Update campaign metrics
    await Campaign.findOneAndUpdate(
      { _id: campaignId, workspaceId },
      {
        $inc: { "metrics.leadsFound": savedLeads.length },
      }
    );

    // 5. Log completion
    await AgentLog.create({
      workspaceId,
      agentId,
      campaignId,
      event: "prospector.completed",
      data: {
        leadsProcessed: savedLeads.length,
        avgIcpScore:
          result.enrichedLeads.reduce((a, b) => a + b.icpScore, 0) /
          result.enrichedLeads.length,
      },
      timestamp: new Date(),
    });

    console.log(
      `[ProspectorJob] Completed. ${savedLeads.length} leads saved.`
    );

    return { leadsFound: savedLeads.length };
  },
  { connection: redis }
);

prospectorWorker.on("completed", (job) => {
  console.log(`[ProspectorWorker] Job ${job.id} completed`);
});

prospectorWorker.on("failed", (job, err) => {
  console.error(`[ProspectorWorker] Job ${job?.id} failed:`, err.message);
});