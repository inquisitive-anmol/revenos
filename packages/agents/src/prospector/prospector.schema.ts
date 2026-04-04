import { z } from "zod";

export const ProspectorInputSchema = z.object({
    icpDescription: z.string().min(10),
    campaignId: z.string(),
    workspaceId: z.string(),
    leads: z.array(
        z.object({
            email: z.string().email(),
            firstName: z.string(),
            lastName: z.string(),
            company: z.string(),
            title: z.string(),
            linkedinUrl: z.string().url().nullable().optional(),
            companySize: z.number().nullable().optional(),
            industry: z.string().nullable().optional(),
        })
    ),
});

export const ProspectorOutputSchema = z.object({
    enrichedLeads: z.array(
        z.object({
            email: z.string().email(),
            firstName: z.string(),
            lastName: z.string(),
            company: z.string(),
            title: z.string(),
            linkedinUrl: z.string().url().nullable().optional(),
            companySize: z.number().nullable().optional(),
            industry: z.string().nullable().optional(),
            icpScore: z.number().min(0).max(10),
            researchNotes: z.string(),
        })
    ),
});

export type ProspectorInput = z.infer<typeof ProspectorInputSchema>;
export type ProspectorOutput = z.infer<typeof ProspectorOutputSchema>;