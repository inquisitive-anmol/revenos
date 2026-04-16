import { ILead } from "@revenos/db";
import { EnrichmentTool, LeadGap } from "../prospector.tools";
import { deductCredits, InsufficientCreditsError } from "@revenos/billing";

export const ApolloTool: EnrichmentTool & { findLeads: (icp: any) => Promise<Partial<ILead>[]> } = {
  name: "Apollo",
  triggers: ["missing_email", "missing_phone", "missing_linkedin"],
  priority: 1, // Highest priority
  enabled: false,
  run: async (lead: ILead, workspaceId: string): Promise<Partial<ILead>> => {
    try {
      console.debug(`[ApolloTool] Apollo stub — not yet enabled for lead ${lead._id}`);

      // When fully enabled, this would map the Apollo response to Partial<ILead>
      // and call deductCredits if lead wasn't completely empty, e.g.:
      // await deductCredits(workspaceId, CREDIT_COSTS.LEAD_SOURCED, "LEAD_SOURCED", lead._id.toString());
      
      return {};
    } catch (error) {
      console.error(`[ApolloTool] Error during execution:`, error);
      return {};
    }
  },
  findLeads: async (icp: any): Promise<Partial<ILead>[]> => {
    console.debug('[ApolloTool] Apollo findLeads stub — not yet enabled, returning empty array');
    return [];
  }
};
