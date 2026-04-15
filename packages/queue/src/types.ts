/**
 * @revenos/queue — types.ts
 *
 * Shared TypeScript interfaces for BullMQ job data payloads.
 * Import these in both the API (when enqueuing) and Workers (when processing)
 * to enforce type safety across the queue boundary.
 */

// ── Prospector ────────────────────────────────────────────────────────────────

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

// ── Qualifier ─────────────────────────────────────────────────────────────────

/** Sent when we want to send the first outreach email to a lead. */
export interface QualifierOutreachJobData {
  workspaceId: string;
  campaignId: string;
  leadId: string;
  fromEmail: string;
  fromName: string;
  replyTo?: string;
  playbook: {
    tone: string;
    valueProposition: string;
    callToAction: string;
  };
}

/** Sent via webhook when a lead replies — routed inside qualifier worker. */
export interface QualifierReplyJobData {
  workspaceId: string;
  campaignId: string;
  leadId: string;
  originalEmail: string;
  replyContent: string;
  fromEmail: string;
  fromName: string;
  playbook: {
    tone: string;
    valueProposition: string;
    callToAction: string;
  };
}

// ── Outreach ──────────────────────────────────────────────────────────────────

export interface OutreachJobData {
  workspaceId: string;
  campaignId: string;
  leadId: string;
  /** True when this is a follow-up email, false for the initial send. */
  isFollowUp: boolean;
  /** 1-based sequence number of the follow-up (undefined for initial send). */
  followUpNumber?: number;
}

// ── Follow-up ─────────────────────────────────────────────────────────────────

export interface FollowUpJobData {
  workspaceId: string;
  campaignId: string;
  leadId: string;
}

// ── Booker Phase 1 ────────────────────────────────────────────────────────────

export interface BookerJobData {
  workspaceId: string;
  campaignId: string;
  leadId: string;
}

// ── Booker Confirm Phase 2 ────────────────────────────────────────────────────

export interface BookerConfirmJobData {
  workspaceId: string;
  campaignId: string;
  leadId: string;
  threadId: string;          // externalThreadId (Resend tracking ID)
  threadObjectId: string;    // MongoDB _id of EmailThread
  replyContent: string;
  proposedSlots: Array<{ start: string; end: string }>;
  bookerMeta: {
    leadEmail: string;
    leadName: string;
    calendarId: string;
    durationMins: number;
  };
  lead: {
    email: string;
    firstName: string;
    lastName: string;
    company: string;
    title: string;
  };
}

/** Shape of the value returned by a completed booker-confirm job. */
export interface BookerConfirmJobResult {
  workspaceId: string;
  campaignId: string;
  leadId: string;
  eventId: string;
  confirmedSlot: { start: string; end: string };
  calendarLink?: string;
}
