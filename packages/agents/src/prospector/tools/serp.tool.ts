import { ILead } from "@revenos/db";
import { EnrichmentTool } from "../prospector.tools";
import { deductCredits, InsufficientCreditsError, CREDIT_COSTS } from "@revenos/billing";

export const SerpTool: EnrichmentTool = {
  name: "SerpAPI",
  triggers: ["missing_company_details", "missing_linkedin"],
  priority: 3,
  enabled: true,
  run: async (lead: ILead, workspaceId: string): Promise<Partial<ILead>> => {
    try {
      if (!lead.company) return {};

      const apiKey = process.env.SERP_API_KEY;
      if (!apiKey) {
        console.warn("[SerpTool] Warning: SERP_API_KEY is not defined.");
        return {};
      }

      const query = `"${lead.company}" company site:linkedin.com OR "${lead.company}" official website`;
      const params = new URLSearchParams({
        engine: 'google',
        q: query,
        api_key: apiKey
      });

      const response = await fetch(`https://serpapi.com/search.json?${params.toString()}`);
      if (!response.ok) {
        console.log(`[SerpTool] API returned status ${response.status}`);
        return {};
      }

      const data = await response.json() as any;
      const organicResults = data.organic_results || [];
      
      const topResults = organicResults.slice(0, 3);
      if (topResults.length === 0) return {};

      let foundDomain = "";
      let foundDescription = "";
      let foundLinkedin = "";

      for (const result of topResults) {
        const link = result.link || "";
        const snippet = result.snippet || "";

        if (!foundLinkedin && link.includes("linkedin.com/company")) {
          foundLinkedin = link;
        } else if (!foundDomain && link.startsWith("http") && !link.includes("linkedin.com")) {
          foundDomain = new URL(link).hostname.replace(/^www\./, "");
        }

        if (snippet.length > foundDescription.length) {
          foundDescription = snippet;
        }
      }

      const enrichment: Partial<ILead> = {};
      if (foundLinkedin) enrichment.linkedinUrl = foundLinkedin;
      if (foundDescription) enrichment.researchNotes = foundDescription;
      
      // Setting domain into enrichmentData
      if (foundDomain || foundDescription) {
        enrichment.enrichmentData = {};
        if (foundDomain) {
          enrichment.enrichmentData.domain = foundDomain;
        }
      }

      if (Object.keys(enrichment).length > 0) {
        try {
          await deductCredits(
            workspaceId,
            CREDIT_COSTS.LEAD_ENRICHED_SERP,
            "LEAD_ENRICHED_SERP",
            lead._id ? lead._id.toString() : undefined
          );
        } catch (err) {
          if (err instanceof InsufficientCreditsError) {
            console.warn(`[SerpTool] Insufficient credits for workspace ${workspaceId}`);
          } else {
            console.error("[SerpTool] Unexpected error deducting credits:", err);
          }
        }
      }

      return enrichment;
    } catch (error) {
      console.error(`[SerpTool] Execution error:`, error);
      return {};
    }
  },
};
