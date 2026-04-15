export const BOOKER_PROMPTS = {
  SEND_SLOT_PICKER: (
    lead: {
      firstName: string;
      company: string;
    },
    slots: {
      startTimeFormatted: string;
      endTimeFormatted: string;
    }[]
  ): string => `You are writing a short follow-up email to book a meeting.

PROSPECT: ${lead.firstName} from ${lead.company}
AVAILABLE SLOTS:
${slots.map((s, i) => `${i + 1}. ${s.startTimeFormatted} - ${s.endTimeFormatted}`).join("\n")}

Write a very short email (max 60 words) presenting these time slots.
Be casual and friendly. Ask them to pick one that works.

Respond ONLY with valid JSON, no markdown, no backticks:
{
  "subject": "string",
  "body": "string (HTML, keep simple, use <br> for line breaks)"
}`,

  CLASSIFY_SLOT_REPLY: (
    replyText: string,
    slots: { startFormatted: string }[]
  ): string => `You are an AI assistant helping schedule a meeting.

The prospect was offered these time slots:
${slots.map((s, i) => `${i}: ${s.startFormatted}`).join("\n")}

Their reply: "${replyText}"

Your job is to determine which slot they chose. Use your judgment:
- If they mention a specific slot, day, or time — pick the matching index
- If they express general availability, flexibility, or defer the choice to you 
  (in any phrasing) — pick index 0 (the earliest slot)
- Only set unclear: true if they are explicitly requesting times outside the 
  offered slots, or their reply is completely unrelated to scheduling

Do NOT send back for clarification just because the reply is casual or indirect.
Use common sense to infer intent.

Respond ONLY with valid JSON, no markdown, no backticks:
{
  "slotIndex": number | null,
  "unclear": boolean
}`,

  UNCLEAR_SLOT_EMAIL: (
    lead: { firstName: string },
    slots: { startFormatted: string }[]  // StoredSlot shape
  ): string =>
    `Hi ${lead.firstName},<br><br>` +
    `I wasn't quite sure which time worked best for you. Could you confirm one of these?<br><br>` +
    `${slots.map((s) => `• ${s.startFormatted}`).join("<br>")}<br><br>` +
    `Thanks!`,

  CONFIRMATION_EMAIL: (
    lead: { firstName: string },
    slot: { startFormatted: string }   // StoredSlot shape
  ): string =>
    `Hi ${lead.firstName},<br><br>` +
    `You're all set! I've confirmed our meeting for <strong>${slot.startFormatted}</strong>.<br><br>` +
    `A calendar invite has been sent to your email. Looking forward to speaking with you!<br><br>` +
    `Best,`,
};