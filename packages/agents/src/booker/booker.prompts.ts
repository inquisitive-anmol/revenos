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
    slots: { startFormatted: string }[]  // StoredSlot shape from MongoDB
  ): string => `You are an AI assistant helping schedule a meeting.

The prospect was offered these time slots:
${slots.map((s, i) => `${i}: ${s.startFormatted}`).join("\n")}

Their reply: "${replyText}"

Determine which slot index they chose (0 to ${slots.length - 1}).
If it is genuinely unclear or they requested different times entirely, set unclear to true and slotIndex to null.

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