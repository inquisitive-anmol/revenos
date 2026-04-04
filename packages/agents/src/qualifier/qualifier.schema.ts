import { z } from "zod";

export const QualifierInputSchema = z.object({
  leadId: z.string(),
  workspaceId: z.string(),
  campaignId: z.string(),
  lead: z.object({
    email: z.string().email(),
    firstName: z.string(),
    lastName: z.string(),
    company: z.string(),
    title: z.string(),
    industry: z.string().nullable().optional(),
    companySize: z.number().nullable().optional(),
    icpScore: z.number(),
    researchNotes: z.string().optional(),
  }),
  emailConfig: z.object({
    fromEmail: z.string().email(),
    fromName: z.string(),
    replyTo: z.string().email().optional(),
  }),
  playbook: z.object({
    tone: z.string().default("professional"),
    valueProposition: z.string(),
    callToAction: z.string(),
  }),
});

export const EmailGenerationOutputSchema = z.object({
  subject: z.string(),
  body: z.string(),
  previewText: z.string(),
});

export const ReplyClassificationSchema = z.object({
  intent: z.enum([
    "interested",
    "not_interested",
    "question",
    "out_of_office",
    "maybe",
  ]),
  score: z.number().min(0).max(10),
  reasoning: z.string(),
  suggestedAction: z.enum([
    "book_meeting",
    "send_followup",
    "disqualify",
    "answer_question",
  ]),
});

export type QualifierInput = z.infer<typeof QualifierInputSchema>;
export type EmailGenerationOutput = z.infer<typeof EmailGenerationOutputSchema>;
export type ReplyClassification = z.infer<typeof ReplyClassificationSchema>;