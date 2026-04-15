import { Job } from "bullmq";
import { Lead, Campaign } from "@revenos/db";
import { transitionLead, isTerminal } from "@revenos/agents";
import { FollowUpJobData } from "@revenos/agents";

export async function processFollowUp(job: Job<FollowUpJobData>) {
  const { leadId, workspaceId, campaignId } = job.data;

  const lead = await (Lead as any).collection.findOne({
    _id: new (require("mongoose").Types.ObjectId)(leadId),
  });

  if (!lead) throw new Error(`Lead not found: ${leadId}`);

  // Already progressed past outreach — skip
  if (
    isTerminal(lead.status) ||
    lead.status === "reply_received" ||
    lead.status === "interested" ||
    lead.status === "meeting_booked"
  ) {
    console.log(`[FollowUp] Lead ${leadId} already progressed, skipping.`);
    return { skipped: true, leadId };
  }

  const campaign = await Campaign.findOne({ _id: campaignId, workspaceId });
  if (!campaign) throw new Error(`Campaign not found: ${campaignId}`);

  // Stop if campaign is not running
  if (campaign.status !== "running") {
    console.log(`[FollowUp] Campaign ${campaignId} not running, skipping.`);
    return { skipped: true, leadId };
  }

  const maxFollowUps = campaign.settings?.maxFollowUps ?? 2;

  if (lead.followUpCount >= maxFollowUps) {
    await transitionLead(leadId, "max_followups_reached", workspaceId);
    console.log(`[FollowUp] Lead ${leadId} reached max follow-ups.`);
    return { maxFollowUpsReached: true, leadId };
  }

  // Transition to scheduled — outreach worker picks it up
  await transitionLead(leadId, "follow_up_scheduled", workspaceId);

  return {
    followUpScheduled: true,
    leadId,
    followUpNumber: lead.followUpCount + 1,
    workspaceId,
    campaignId,
  };
}