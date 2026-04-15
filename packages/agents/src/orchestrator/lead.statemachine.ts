import { Lead, LeadStatus } from "@revenos/db";

const VALID_TRANSITIONS: Record<LeadStatus, LeadStatus[]> = {
  pending: ["qualifying"],
  qualifying: ["qualified", "disqualified"],
  qualified: ["outreach_sent"],
  disqualified: [],
  outreach_sent: ["reply_received", "follow_up_scheduled"],
  reply_received: ["interested", "not_interested"],
  interested: ["meeting_booked"],
  not_interested: [],
  follow_up_scheduled: ["follow_up_sent"],
  follow_up_sent: ["reply_received", "follow_up_scheduled", "max_followups_reached"],
  max_followups_reached: [],
  meeting_booked: [],
};

export const TERMINAL_STATUSES: LeadStatus[] = [
  "disqualified",
  "not_interested",
  "max_followups_reached",
  "meeting_booked",
];

export async function transitionLead(
  leadId: string,
  newStatus: LeadStatus,
  workspaceId: string,
  extra?: Partial<{
    followUpCount: number;
    lastContactedAt: Date;
    icpScore: number;
    researchNotes: string;
  }>
): Promise<void> {
  const lead = await (Lead as any).collection.findOne({ _id: new (require("mongoose").Types.ObjectId)(leadId) });
  if (!lead) throw new Error(`Lead not found: ${leadId}`);

  const allowed = VALID_TRANSITIONS[lead.status as LeadStatus];
  if (!allowed.includes(newStatus)) {
    throw new Error(`Invalid transition: ${lead.status} → ${newStatus} for lead ${leadId}`);
  }

  const update: Record<string, unknown> = { status: newStatus };
  if (extra?.followUpCount !== undefined) update.followUpCount = extra.followUpCount;
  if (extra?.lastContactedAt) update.lastContactedAt = extra.lastContactedAt;
  if (extra?.icpScore !== undefined) update.icpScore = extra.icpScore;
  if (extra?.researchNotes) update.researchNotes = extra.researchNotes;

  await (Lead as any).collection.updateOne(
    { _id: new (require("mongoose").Types.ObjectId)(leadId) },
    { $set: update }
  );
}

export function isTerminal(status: LeadStatus): boolean {
  return TERMINAL_STATUSES.includes(status);
}