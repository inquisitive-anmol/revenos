
export type AgentType = "prospector" | "qualifier" | "booker";

export type ProspectorState =
  | "idle"
  | "searching"
  | "enriching"
  | "waiting"
  | "handoff"
  | "done"
  | "error";

export type QualifierState =
  | "pending"
  | "composing"
  | "email_sent"
  | "awaiting_reply"
  | "reply_received"
  | "follow_up"
  | "qualified"
  | "disqualified"
  | "handoff"
  | "human_takeover";

export type BookerState =
  | "received"
  | "checking_cal"
  | "invite_sent"
  | "booked"
  | "rescheduled"
  | "no_show"
  | "complete";