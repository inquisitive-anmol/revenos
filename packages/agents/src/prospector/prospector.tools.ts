import { ILead } from "@revenos/db";
import { ApolloTool } from "./tools/apollo.tool";
import { HunterTool } from "./tools/hunter.tool";
import { SerpTool } from "./tools/serp.tool";
import { deductCredits } from "@revenos/billing";

export type LeadGap =
  | "missing_email"
  | "missing_company"
  | "missing_linkedin"
  | "missing_phone"
  | "missing_company_details";

export interface EnrichmentTool {
  name: string;
  triggers: LeadGap[];
  priority: number;
  enabled: boolean;
  run: (lead: ILead, workspaceId: string) => Promise<Partial<ILead>>;
}

const registry: EnrichmentTool[] = [ApolloTool, HunterTool, SerpTool]
  .filter((t) => t.enabled)
  .sort((a, b) => a.priority - b.priority);

function detectGaps(lead: ILead | Partial<ILead>): LeadGap[] {
  const gaps: LeadGap[] = [];
  if (!lead.email) gaps.push("missing_email");
  if (!lead.company) gaps.push("missing_company");
  if (!lead.linkedinUrl) gaps.push("missing_linkedin");
  // Phone isn't officially on ILead, but enrichmentData could hold it
  if (!lead.enrichmentData?.phone) gaps.push("missing_phone");
  // Company details: industry, companySize, researchNotes
  if (!lead.industry || !lead.companySize) gaps.push("missing_company_details");
  return gaps;
}

export async function enrichLead(
  lead: ILead,
  workspaceId: string
): Promise<ILead> {
  let currentLead = lead.toObject ? lead.toObject() : { ...lead };
  let currentGaps = detectGaps(currentLead);

  if (currentGaps.length === 0) {
    return lead; // Idempotent: already has everything
  }

  for (const tool of registry) {
    // Check if the tool can fill any of the current gaps
    const overlaps = tool.triggers.some((trigger) => currentGaps.includes(trigger));
    if (!overlaps) continue;

    try {
      const result = await tool.run(lead, workspaceId);

      // Merge results
      if (Object.keys(result).length > 0) {
        currentLead = { ...currentLead, ...result };
        
        // Merge enrichmentData separately to avoid wiping out existing
        if (result.enrichmentData) {
          currentLead.enrichmentData = {
            ...(currentLead.enrichmentData || {}),
            ...result.enrichmentData,
          };
        }
      }
    } catch (e) {
      console.error(`[Enrichment] Tool ${tool.name} failed:`, e);
      // Tools shouldn't throw, but catching just in case to maintain flow
    }

    // Re-check gaps after the tool run
    currentGaps = detectGaps(currentLead);
    if (currentGaps.length === 0) break; // Finished finding all we need
  }

  // To return the exact lead instance type might require assigning back properties
  Object.assign(lead, currentLead);
  return lead;
}
