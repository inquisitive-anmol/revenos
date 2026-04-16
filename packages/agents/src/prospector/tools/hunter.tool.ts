import { ILead } from "@revenos/db";
import { EnrichmentTool } from "../prospector.tools";
import { deductCredits, InsufficientCreditsError, CREDIT_COSTS } from "@revenos/billing";

export const HunterTool: EnrichmentTool = {
  name: "Hunter",
  triggers: ["missing_email"],
  priority: 2,
  enabled: true,
  run: async (lead: ILead, workspaceId: string): Promise<Partial<ILead>> => {
    try {
      if (!lead.firstName || !lead.lastName) return {};

      // Deduce domain if missing
      const domain = lead.enrichmentData?.domain as string || (lead.company ? `${lead.company.toLowerCase().replace(/[^a-z0-9]/g, '')}.com` : null);
      if (!domain) return {};

      const apiKey = process.env.HUNTER_API_KEY;
      if (!apiKey) {
        console.warn("[HunterTool] Warning: HUNTER_API_KEY is not defined.");
        return {};
      }

      const params = new URLSearchParams({
        domain,
        first_name: lead.firstName,
        last_name: lead.lastName,
        api_key: apiKey
      });

      const response = await fetch(`https://api.hunter.io/v2/email-finder?${params.toString()}`);
      
      if (!response.ok) {
        console.log(`[HunterTool] API returned status ${response.status}`);
        return {};
      }

      const data = await response.json();
      
      // We are looking for data.data.email and data.data.score
      if (data && data.data && data.data.email) {
        const confidence = data.data.score || 0;
        
        if (confidence >= 70) {
          try {
            await deductCredits(
              workspaceId,
              CREDIT_COSTS.LEAD_ENRICHED_HUNTER,
              "LEAD_ENRICHED_HUNTER",
              lead._id ? lead._id.toString() : undefined
            );
          } catch (err) {
            if (err instanceof InsufficientCreditsError) {
              console.warn(`[HunterTool] Insufficient credits for workspace ${workspaceId}`);
            } else {
              console.error("[HunterTool] Unexpected error deducting credits:", err);
            }
          }

          return {
            email: data.data.email,
            enrichmentData: { emailConfidence: confidence }
          };
        }
      }

      return {};
    } catch (error) {
      console.error(`[HunterTool] Execution error:`, error);
      return {};
    }
  },
};
