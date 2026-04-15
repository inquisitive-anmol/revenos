import { Job } from "bullmq";
import { Campaign, Lead } from "@revenos/db";
import { transitionLead, isTerminal, TERMINAL_STATUSES } from "./lead.statemachine";
import { OutreachJobData, BookerConfirmJobResult, FollowUpJobData } from "./HandoffProtocol";

// These are called by workers/src/index.ts after worker init
// Each function receives a completed job and drives the next step

export async function onProspectorCompleted(job: Job): Promise<void> {
  // Prospector creates leads in DB directly — no per-lead transition needed here
  // Campaign metrics already updated inside prospector.job.ts
  console.log(`[Orchestrator] Prospector job ${job.id} completed. Leads saved by worker.`);
}

export async function onOutreachCompleted(job: Job, outreachQueue: any, followUpQueue: any): Promise<void> {
  const { leadId, workspaceId, campaignId, isFollowUp, followUpNumber } = job.data as OutreachJobData;
  if (!leadId) return;

  if (isFollowUp) {
    await transitionLead(leadId, "follow_up_sent", workspaceId, {
      followUpCount: followUpNumber,
      lastContactedAt: new Date(),
    });
  } else {
    await transitionLead(leadId, "outreach_sent", workspaceId, {
      lastContactedAt: new Date(),
    });
  }

  await Campaign.findOneAndUpdate(
    { _id: campaignId, workspaceId },
    { $inc: { "metrics.emailsSent": 1 } }
  );

  // Schedule follow-up check
  const campaign = await Campaign.findOne({ _id: campaignId, workspaceId });
  if (!campaign || campaign.status !== "running") return;

  const lead = await (Lead as any).collection.findOne({
    _id: new (require("mongoose").Types.ObjectId)(leadId),
  });

  const currentFollowUpCount = isFollowUp ? (followUpNumber ?? 1) : 0;
  const maxFollowUps = campaign.settings?.maxFollowUps ?? 2;

  if (currentFollowUpCount < maxFollowUps) {
    const delayMs = (campaign.settings?.followUpDelayHours ?? 48) * 60 * 60 * 1000;
    await followUpQueue.add(
      "check-followup",
      { leadId, workspaceId, campaignId } as FollowUpJobData,
      { delay: delayMs }
    );
  }
}

export async function onBookerConfirmCompleted(job: Job): Promise<void> {
  const { leadId, workspaceId, campaignId } = job.returnvalue as BookerConfirmJobResult;
  if (!leadId) return;

  await transitionLead(leadId, "meeting_booked", workspaceId);

  await Campaign.findOneAndUpdate(
    { _id: campaignId, workspaceId },
    { $inc: { "metrics.meetingsBooked": 1 } }
  );

  await checkCampaignCompletion(campaignId, workspaceId);
}

export async function checkCampaignCompletion(
  campaignId: string,
  workspaceId: string
): Promise<void> {
  const total = await (Lead as any).collection.countDocuments({ 
    campaignId: new (require("mongoose").Types.ObjectId)(campaignId),
    workspaceId 
  });
  
  const terminal = await (Lead as any).collection.countDocuments({
    campaignId: new (require("mongoose").Types.ObjectId)(campaignId),
    workspaceId,
    status: { $in: TERMINAL_STATUSES },
  });

  if (total > 0 && total === terminal) {
    await Campaign.findOneAndUpdate(
      { _id: campaignId, workspaceId },
      { status: "completed", completedAt: new Date() }
    );
    console.log(`[Orchestrator] Campaign ${campaignId} completed.`);
  }
}