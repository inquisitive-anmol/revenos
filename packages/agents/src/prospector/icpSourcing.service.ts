import { CREDIT_COSTS } from '@revenos/billing';
import { ILead } from '@revenos/db';
import { ApolloTool } from './tools/apollo.tool';
import { ICPInput } from './icp.schema';

export async function sourceLeadsFromICP(
  icp: ICPInput,
  campaignId: string,
  workspaceId: string
): Promise<{ rawLeads: Partial<ILead>[], estimatedCredits: number }> {
  // 1. Try Apollo (stubbed)
  let rawLeads: Partial<ILead>[] = await ApolloTool.findLeads(icp);

  // 2. Fallback to SerpAPI if Apollo is disabled/empty
  if (rawLeads.length === 0) {
    rawLeads = await serpFallbackSearch(icp);
  }

  // 3. Deduplicate
  const uniqueLeads = new Map<string, Partial<ILead>>();
  for (const lead of rawLeads) {
    // Generate a deduplication key
    const emailKey = lead.email ? lead.email.toLowerCase() : null;
    const nameKey = (lead.firstName || '') + (lead.lastName || '') + (lead.company || '');
    const finalKey = emailKey || nameKey.toLowerCase().replace(/\s+/g, '');

    if (!finalKey) continue;

    if (!uniqueLeads.has(finalKey)) {
      uniqueLeads.set(finalKey, lead);
    }
  }

  let finalLeads = Array.from(uniqueLeads.values());

  // 4. Slice to maxLeads
  const maxLeads = icp.maxLeads ?? 50;
  if (finalLeads.length > maxLeads) {
    finalLeads = finalLeads.slice(0, maxLeads);
  }

  return {
    rawLeads: finalLeads,
    estimatedCredits: finalLeads.length * CREDIT_COSTS.LEAD_SOURCED
  };
}

async function serpFallbackSearch(icp: ICPInput): Promise<Partial<ILead>[]> {
  const apiKey = process.env.SERP_API_KEY;
  if (!apiKey) {
    console.warn("[icpSourcing.service] Warning: SERP_API_KEY is not defined. Cannot perform fallback.");
    return [];
  }

  const leads: Partial<ILead>[] = [];
  const maxLeads = icp.maxLeads ?? 50;

  // Extremely basic combinations for best-effort fallback
  const combinations: { title: string, industry: string }[] = [];
  for (const industry of icp.industries || []) {
    for (const title of icp.titles || []) {
      combinations.push({ industry, title });
    }
  }

  // If no combination, just query empty strings to let other params work
  if (combinations.length === 0) {
    combinations.push({ industry: '', title: '' });
  }

  for (const combo of combinations) {
    if (leads.length >= maxLeads) break;

    const queryParts = [];
    if (combo.title) queryParts.push(`"${combo.title}"`);
    if (combo.industry) queryParts.push(`"${combo.industry}"`);
    if (icp.keywords && icp.keywords.length > 0) queryParts.push(...icp.keywords);
    if (icp.locations && icp.locations.length > 0) queryParts.push(`"${icp.locations[0]}"`); // Simplification for fallback
    queryParts.push("site:linkedin.com/in");

    const query = queryParts.join(" ");
    const params = new URLSearchParams({
      engine: 'google',
      q: query,
      api_key: apiKey,
      num: '20' // Get a batch per combination
    });

    try {
      const response = await fetch(`https://serpapi.com/search.json?${params.toString()}`);
      if (!response.ok) continue;

      const data = await response.json();
      const organicResults = data.organic_results || [];

      for (const result of organicResults) {
        if (leads.length >= maxLeads) break;

        const titleText = result.title || "";
        const snippet = result.snippet || "";
        const link = result.link || "";

        // Extremely naive scraping pattern for "Name - Title - Company | LinkedIn"
        const titleParts = titleText.split(" - ");
        if (titleParts.length < 2) continue;

        const rawName = titleParts[0].split(" | ")[0].trim();
        const rawTitleCompany = titleParts[1].split(" | ")[0].trim();
        
        let firstName = rawName;
        let lastName = "";
        const nameTokens = rawName.split(" ");
        if (nameTokens.length > 1) {
          firstName = nameTokens[0];
          lastName = nameTokens.slice(1).join(" ");
        }

        // Try extracting company from "Title at Company"
        let company = combo.industry; // Fallback
        const atSplit = rawTitleCompany.split(" at ");
        if (atSplit.length > 1) {
          company = atSplit[1].trim();
        }

        leads.push({
          firstName,
          lastName,
          company,
          title: combo.title || rawTitleCompany,
          linkedinUrl: link.includes("linkedin.com") ? link : undefined,
          researchNotes: snippet
        });
      }
    } catch (error) {
      console.error(`[icpSourcing.service] SerpAPI fallback error:`, error);
    }
  }

  return leads;
}
