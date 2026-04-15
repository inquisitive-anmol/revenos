import { Campaign, ICampaign } from "@revenos/db";

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