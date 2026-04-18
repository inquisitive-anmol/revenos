// Typed job data contracts between all agents
// Both api (queue producers) and workers (consumers) import from here

import { Workflow } from "./WorkflowExecutor";

export interface ProspectorJobData {
  nodeId?: string;
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
  nodeId?: string;
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
  nodeId?: string;
  workspaceId: string;
  campaignId: string;
  leadId: string;
  threadId: string;
  threadObjectId: string;
}

export interface BookerConfirmJobData {
  nodeId?: string;
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
  nodeId?: string;
  workspaceId: string;
  campaignId: string;
  leadId: string;
}

export const DEFAULT_WORKFLOW: Workflow = {
  nodes: [
    { id: 'n1', type: 'prospector', position: {x:0,y:0}, config: {} },
    { id: 'n2', type: 'qualifier', position: {x:0,y:0}, config: {} },
    { id: 'n3', type: 'booker', position: {x:0,y:0}, config: {} }
  ],
  edges: [
    { id: 'e1', source: 'n1', target: 'n2' },
    { id: 'e2', source: 'n2', target: 'n3' }
  ]
};