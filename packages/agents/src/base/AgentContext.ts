export interface AgentContext {
  workspaceId: string;
  campaignId: string;
  agentId: string;
  config: {
    icpDescription: string;
    emailTone: string;
    followUpDays: number[];
    qualificationThreshold: number;
  };
}