import { Lead, ILead } from "@revenos/db";

export const getLeads = async (
  workspaceId: string,
  filters: {
    status?: string;
    campaignId?: string;
    score_gte?: number;
  } = {}
): Promise<ILead[]> => {
  const query: Record<string, unknown> = { workspaceId };

  if (filters.status) query.status = filters.status;
  if (filters.campaignId) query.campaignId = filters.campaignId;
  if (filters.score_gte) query.icpScore = { $gte: filters.score_gte };

  return Lead.find(query).sort({ createdAt: -1 });
};

export const getLeadById = async (
  workspaceId: string,
  leadId: string
): Promise<ILead | null> => {
  return Lead.findOne({ _id: leadId, workspaceId });
};

export const takeoverLead = async (
  workspaceId: string,
  leadId: string
): Promise<ILead | null> => {
  return Lead.findOneAndUpdate(
    { _id: leadId, workspaceId },
    { humanControlled: true, status: "contacted" },
    { new: true }
  );
};

export const handbackLead = async (
  workspaceId: string,
  leadId: string
): Promise<ILead | null> => {
  return Lead.findOneAndUpdate(
    { _id: leadId, workspaceId },
    { humanControlled: false },
    { new: true }
  );
};