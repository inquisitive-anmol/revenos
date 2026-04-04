export interface ProspectorJobData {
  workspaceId: string;
  campaignId: string;
  agentId: string;
  icpDescription: string;
  leads: {
    email: string;
    firstName: string;
    lastName: string;
    company: string;
    title: string;
    linkedinUrl?: string;
    companySize?: number;
    industry?: string;
  }[];
}