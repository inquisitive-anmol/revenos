export type LeadStatus =
  | "prospecting"
  | "contacted"
  | "qualified"
  | "disqualified"
  | "meeting_booked"
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