import { Campaign, ICampaign } from "@revenos/db";

export const createCampaign = async (
  workspaceId: string,
  name: string,
  icpDescription: string
): Promise<ICampaign> => {
  return Campaign.create({
    workspaceId,
    name,
    settings: { icpDescription },
  });
};

export const getCampaigns = async (
  workspaceId: string
): Promise<ICampaign[]> => {
  return Campaign.find({ workspaceId }).sort({ createdAt: -1 });
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