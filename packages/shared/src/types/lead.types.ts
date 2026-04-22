export type LeadStatus =
  | "pending"
  | "qualifying"
  | "qualified"
  | "disqualified"
  | "outreach_sent"
  | "reply_received"
  | "interested"
  | "not_interested"
  | "follow_up_scheduled"
  | "follow_up_sent"
  | "max_followups_reached"
  | "meeting_booked"
  | "prospecting"
  | "contacted"
  | "opened"
  | "closed";

export interface Lead {
  id: string;
  workspaceId: string;
  email: string;
  firstName: string;
  lastName: string;
  company: string;
  title: string;
  linkedinUrl?: string;
  companySize?: number;
  industry?: string;
  icpScore: number;
  status: LeadStatus;
  researchNotes?: string;
  createdAt: Date;
}