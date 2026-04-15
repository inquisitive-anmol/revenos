import { prospectorQueue } from "@revenos/queue";
import { Campaign, Agent } from "@revenos/db";
import { ProspectorJobData } from "@/services/types";
import { NotFoundError } from "@/errors/AppError";

export interface LeadInput {
  email: string;
  firstName: string;
  lastName: string;
  company: string;
  title: string;
  linkedinUrl?: string;
  companySize?: number;
  industry?: string;
}

export const triggerProspector = async (
  workspaceId: string,
  campaignId: string,
  leads: LeadInput[]
): Promise<{ jobId: string; leadsQueued: number }> => {
  // 1. Verify campaign exists and belongs to workspace
  const campaign = await Campaign.findOne({
    _id: campaignId,
    workspaceId,
  });

  if (!campaign) {
    throw new NotFoundError("Campaign");
  }

  // 2. Get or create prospector agent for this campaign
  let agent = await Agent.findOne({
    workspaceId,
    type: "prospector",
  });

  if (!agent) {
    agent = await Agent.create({
      workspaceId,
      type: "prospector",
      config: {
        icpDescription: campaign.settings.icpDescription,
        emailTone: "professional",
        followUpDays: [0, 3, 7],
        qualificationThreshold: 7,
      },
      status: "idle",
    });
  }

  // 3. Update campaign status to active
  await Campaign.findOneAndUpdate(
    { _id: campaignId, workspaceId },
    { status: "active" }
  );

  // 4. Enqueue BullMQ job
  const job = await prospectorQueue.add(
    "prospect",
    {
      workspaceId,
      campaignId,
      agentId: agent._id.toString(),
      icpDescription: campaign.settings.icpDescription,
      leads,
    } as ProspectorJobData,
    {
      attempts: 3,
      backoff: {
        type: "exponential",
        delay: 2000,
      },
    }
  );

  return {
    jobId: job.id!,
    leadsQueued: leads.length,
  };
};