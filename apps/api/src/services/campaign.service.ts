import { Campaign, ICampaign, Lead } from "@revenos/db";
import { Types } from "mongoose";

export const createCampaign = async (
  workspaceId: string,
  name: string,
  icpDescription: string,
  options?: {
    industry?: string;
    companySize?: string;
    jobTitles?: string;
    problemToSolve?: string;
    goal?: string;
    status?: string;
  }
): Promise<ICampaign> => {
  return Campaign.create({
    workspaceId,
    name,
    status: options?.status || "draft",
    settings: {
      icpDescription,
      industry: options?.industry,
      companySize: options?.companySize,
      jobTitles: options?.jobTitles,
      problemToSolve: options?.problemToSolve,
      goal: options?.goal || "Lead Generation",
      dailyEmailLimit: 50,
      timezone: "UTC",
    },
  });
};

export const getCampaigns = async (
  workspaceId: string,
  page: number = 1,
  limit: number = 20
): Promise<{ campaigns: ICampaign[]; total: number }> => {
  const [campaigns, total] = await Promise.all([
    Campaign.find({ workspaceId })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    Campaign.countDocuments({ workspaceId }),
  ]);
  return { campaigns: campaigns as ICampaign[], total };
};

export const getCampaignById = async (
  workspaceId: string,
  campaignId: string
): Promise<ICampaign | null> => {
  return Campaign.findOne({ _id: campaignId, workspaceId });
};

export const updateCampaignStatus = async (
  workspaceId: string,
  campaignId: string,
  status: ICampaign["status"]
): Promise<ICampaign | null> => {
  return Campaign.findOneAndUpdate(
    { _id: campaignId, workspaceId },
    { status },
    { new: true }
  );
};

export const getCampaignStatusBreakdown = async (
  workspaceId: string,
  campaignId: string
): Promise<{ campaign: ICampaign; leadBreakdown: Record<string, number> } | null> => {
  const campaign = await Campaign.findOne({ _id: campaignId, workspaceId });
  if (!campaign) return null;

  const result = await Lead.aggregate([
    {
      $match: {
        campaignId: new Types.ObjectId(campaignId),
        workspaceId,
      },
    },
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 },
      },
    },
  ]);

  const leadBreakdown: Record<string, number> = {
    pending: 0,
    qualifying: 0,
    qualified: 0,
    disqualified: 0,
    outreach_sent: 0,
    reply_received: 0,
    interested: 0,
    not_interested: 0,
    follow_up_scheduled: 0,
    follow_up_sent: 0,
    max_followups_reached: 0,
    meeting_booked: 0,
  };

  result.forEach((group) => {
    leadBreakdown[group._id] = group.count;
  });

  return { campaign: campaign.toObject(), leadBreakdown };
};