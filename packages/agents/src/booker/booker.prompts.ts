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
  ) => `You are writing a short follow-up email to book a meeting.

PROSPECT: ${lead.firstName} from ${lead.company}
AVAILABLE SLOTS: ${slots.map((s, i) => `${i + 1}. ${s.startTimeFormatted} - ${s.endTimeFormatted}`).join("\n")}

Write a very short email (max 60 words) presenting these time slots.
Be casual and friendly. Ask them to pick one that works.

Respond ONLY with valid JSON, no markdown:
{
  "subject": "string",
  "body": "string (HTML, keep simple)"
}`,
};