import { Campaign, Lead } from "@revenos/db";
import { CampaignStatus } from "@revenos/db";

const BATCH_SIZE = 10;

export class Orchestrator {
  private prospectorQueue: any;
  private workspaceId: string;

  private feederQueue: any;

  constructor(prospectorQueue: any, feederQueue: any, workspaceId: string) {
    this.prospectorQueue = prospectorQueue;
    this.feederQueue = feederQueue;
    this.workspaceId = workspaceId;
  }

  async startCampaign(campaignId: string): Promise<void> {
    const campaign = await Campaign.findOne({ _id: campaignId, workspaceId: this.workspaceId });
    if (!campaign) throw new Error("Campaign not found");
    if (campaign.status === "running") throw new Error("Campaign already running");
    if (campaign.status === "completed") throw new Error("Campaign already completed");

    await Campaign.findOneAndUpdate(
      { _id: campaignId, workspaceId: this.workspaceId },
      { status: "running", startedAt: new Date() }
    );

    await this.feedLeads(campaignId);
    console.log(`[Orchestrator] Campaign ${campaignId} started.`);
  }

  async pauseCampaign(campaignId: string): Promise<void> {
    const campaign = await Campaign.findOne({ _id: campaignId, workspaceId: this.workspaceId });
    if (!campaign) throw new Error("Campaign not found");
    if (campaign.status !== "running") throw new Error("Campaign is not running");

    await Campaign.findOneAndUpdate(
      { _id: campaignId, workspaceId: this.workspaceId },
      { status: "paused" }
    );
    console.log(`[Orchestrator] Campaign ${campaignId} paused.`);
  }

  async resumeCampaign(campaignId: string): Promise<void> {
    const campaign = await Campaign.findOne({ _id: campaignId, workspaceId: this.workspaceId });
    if (!campaign) throw new Error("Campaign not found");
    if (campaign.status !== "paused") throw new Error("Campaign is not paused");

    await Campaign.findOneAndUpdate(
      { _id: campaignId, workspaceId: this.workspaceId },
      { status: "running" }
    );

    await this.feedLeads(campaignId);
    console.log(`[Orchestrator] Campaign ${campaignId} resumed.`);
  }

  async stopCampaign(campaignId: string): Promise<void> {
    const campaign = await Campaign.findOne({ _id: campaignId, workspaceId: this.workspaceId });
    if (!campaign) throw new Error("Campaign not found");
    if (campaign.status === "completed") throw new Error("Campaign already completed");

    await Campaign.findOneAndUpdate(
      { _id: campaignId, workspaceId: this.workspaceId },
      { status: "draft" }
    );

    // Reset in-progress leads back to pending
    await Lead.updateMany(
      {
        campaignId,
        workspaceId: this.workspaceId,
        status: { $in: ["qualifying", "qualified", "outreach_sent", "follow_up_scheduled"] },
      },
      { $set: { status: "pending" } }
    );

    console.log(`[Orchestrator] Campaign ${campaignId} stopped.`);
  }

  async feedLeads(campaignId: string): Promise<void> {
    const campaign = await Campaign.findOne({ _id: campaignId, workspaceId: this.workspaceId });
    if (!campaign || campaign.status !== "running") return;

    const leads = await Lead.find({
      campaignId,
      workspaceId: this.workspaceId,
      status: "pending",
    }).limit(BATCH_SIZE);

    for (const lead of leads) {
      await this.prospectorQueue.add("qualify-lead", {
        workspaceId: this.workspaceId,
        campaignId,
        agentId: campaign.agentIds[0]?.toString(),
        icpDescription: campaign.settings.icpDescription,
        leads: [{
          email: lead.email,
          firstName: lead.firstName,
          lastName: lead.lastName,
          company: lead.company,
          title: lead.title,
          linkedinUrl: lead.linkedinUrl,
          companySize: lead.companySize,
          industry: lead.industry,
        }],
      });

      lead.status = "qualifying";
      await lead.save();
    }

    // If more pending leads remain, schedule next batch
    const remaining = await Lead.countDocuments({
      campaignId,
      workspaceId: this.workspaceId,
      status: "pending",
    });

    if (remaining > 0) {
      await this.feederQueue.add("feed", { campaignId, workspaceId: this.workspaceId }, { delay: 2000, jobId: `feed:${campaignId}` });
    }
  }
}