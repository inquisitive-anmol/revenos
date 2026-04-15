// Typed job data contracts between all agents
// Both api (queue producers) and workers (consumers) import from here

export interface ProspectorJobData {
  workspaceId: string;
  campaignId: string;
  agentId: string;
  icpDescription: string;
  leads: Array<{
    email: string;
    firstName: string;
    lastName: string;
    company: string;
    title: string;
    linkedinUrl?: string;
    companySize?: number;
    industry?: string;
  }>;
}

export interface ProspectorJobResult {
  workspaceId: string;
  campaignId: string;
  leadsFound: number;
}

export interface OutreachJobData {
  workspaceId: string;
  campaignId: string;
  agentId: string;
  leadId: string;
  isFollowUp?: boolean;
  followUpNumber?: number;
}

export interface OutreachJobResult {
  workspaceId: string;
  campaignId: string;
  leadId: string;
  emailSent: boolean;
}

export interface BookerJobData {
  workspaceId: string;
  campaignId: string;
  leadId: string;
  threadId: string;
  threadObjectId: string;
}

export interface BookerConfirmJobData {
  workspaceId: string;
  campaignId: string;
  leadId: string;
  threadId: string;
  threadObjectId: string;
}

export interface BookerConfirmJobResult {
  workspaceId: string;
  campaignId: string;
  leadId: string;
  meetingBooked: boolean;
}

export interface FollowUpJobData {
  workspaceId: string;
  campaignId: string;
  leadId: string;
}