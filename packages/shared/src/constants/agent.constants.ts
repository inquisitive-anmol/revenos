export const QUALIFICATION_SCORE_THRESHOLD = 7;

export const FOLLOW_UP_DAYS = [0, 3, 7];

export const QUEUE_NAMES = {
  PROSPECTOR: "prospector",
  QUALIFIER: "qualifier",
  BOOKER: "booker",
} as const;

export const AGENT_EVENTS = {
  LEAD_FOUND: "lead.found",
  LEAD_ENRICHED: "lead.enriched",
  LEAD_FAILED: "lead.failed",
  EMAIL_SENT: "email.sent",
  REPLY_RECEIVED: "reply.received",
  LEAD_QUALIFIED: "lead.qualified",
  LEAD_DISQUALIFIED: "lead.disqualified",
  MEETING_BOOKED: "meeting.booked",
} as const;