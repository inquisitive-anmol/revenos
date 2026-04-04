export const PROSPECTOR_STATES = {
  IDLE: "idle",
  SEARCHING: "searching",
  ENRICHING: "enriching",
  WAITING: "waiting",
  HANDOFF: "handoff",
  DONE: "done",
  ERROR: "error",
} as const;

export const QUALIFIER_STATES = {
  PENDING: "pending",
  COMPOSING: "composing",
  EMAIL_SENT: "email_sent",
  AWAITING_REPLY: "awaiting_reply",
  REPLY_RECEIVED: "reply_received",
  FOLLOW_UP: "follow_up",
  QUALIFIED: "qualified",
  DISQUALIFIED: "disqualified",
  HANDOFF: "handoff",
  HUMAN_TAKEOVER: "human_takeover",
} as const;

export const BOOKER_STATES = {
  RECEIVED: "received",
  CHECKING_CAL: "checking_cal",
  INVITE_SENT: "invite_sent",
  BOOKED: "booked",
  RESCHEDULED: "rescheduled",
  NO_SHOW: "no_show",
  COMPLETE: "complete",
} as const;

export type ProspectorState =
  (typeof PROSPECTOR_STATES)[keyof typeof PROSPECTOR_STATES];
export type QualifierState =
  (typeof QUALIFIER_STATES)[keyof typeof QUALIFIER_STATES];
export type BookerState =
  (typeof BOOKER_STATES)[keyof typeof BOOKER_STATES];