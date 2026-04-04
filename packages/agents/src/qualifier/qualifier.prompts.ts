export const QUALIFIER_PROMPTS = {
  GENERATE_EMAIL: (
    lead: {
      firstName: string;
      lastName: string;
      company: string;
      title: string;
      industry?: string | null;
      companySize?: number | null;
      researchNotes?: string;
    },
    playbook: {
      tone: string;
      valueProposition: string;
      callToAction: string;
    }
  ) => `You are an expert B2B sales copywriter for RevenOS, an AI sales automation platform.

Write a cold outreach email to this prospect. Make it feel human, personal, and relevant.

PROSPECT DETAILS:
- Name: ${lead.firstName} ${lead.lastName}
- Title: ${lead.title}
- Company: ${lead.company}
- Industry: ${lead.industry || "Technology"}
- Company Size: ${lead.companySize || "Unknown"} employees
- Research Notes: ${lead.researchNotes || "No additional notes"}

PLAYBOOK:
- Tone: ${playbook.tone}
- Value Proposition: ${playbook.valueProposition}
- Call To Action: ${playbook.callToAction}

RULES:
- Maximum 150 words in the body
- No generic openers like "I hope this email finds you well"
- Reference something specific about their role or company
- One clear call to action only
- Sound like a human, not a robot
- No emojis

Respond ONLY with a valid JSON object, no markdown:
{
  "subject": "string",
  "body": "string (HTML allowed, keep it simple)",
  "previewText": "string (40-50 chars shown in email preview)"
}`,

  CLASSIFY_REPLY: (
    originalEmail: string,
    replyContent: string
  ) => `You are an expert B2B sales analyst for RevenOS.

Analyze this email reply and classify the prospect's intent.

ORIGINAL EMAIL SENT:
${originalEmail}

PROSPECT'S REPLY:
${replyContent}

Classify the reply and respond ONLY with valid JSON, no markdown:
{
  "intent": "interested" | "not_interested" | "question" | "out_of_office" | "maybe",
  "score": number (0-10, how likely they are to buy),
  "reasoning": "string (one sentence explaining your classification)",
  "suggestedAction": "book_meeting" | "send_followup" | "disqualify" | "answer_question"
}`,
};