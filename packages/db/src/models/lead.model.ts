import mongoose, { Schema, Document } from "mongoose";
import { tenancyPlugin } from "../plugins/tenancy.plugin";

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

export interface ILead extends Document {
  workspaceId: string;
  campaignId: mongoose.Types.ObjectId;
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
  enrichmentData: Record<string, unknown>;
  researchNotes?: string;
  tags: string[];
  followUpCount: number;
  lastContactedAt?: Date;
  createdAt: Date;
  humanControlled: boolean;
}

const LeadSchema = new Schema<ILead>(
  {
    workspaceId: { type: String, required: true },
    campaignId: {
      type: Schema.Types.ObjectId,
      ref: "Campaign",
      required: true,
    },
    email: { type: String, required: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    company: { type: String, required: true },
    title: { type: String, required: true },
    linkedinUrl: { type: String },
    companySize: { type: Number },
    industry: { type: String },
    icpScore: { type: Number, default: 0, min: 0, max: 10 },
    status: {
      type: String,
      enum: [
        "pending",
        "qualifying",
        "qualified",
        "disqualified",
        "outreach_sent",
        "reply_received",
        "interested",
        "not_interested",
        "follow_up_scheduled",
        "follow_up_sent",
        "max_followups_reached",
        "meeting_booked",
        "prospecting",
        "contacted",
        "opened",
        "closed",
      ],
      default: "pending",
    },
    enrichmentData: { type: Schema.Types.Mixed, default: {} },
    researchNotes: { type: String },
    tags: [{ type: String }],
    followUpCount: { type: Number, default: 0 },
    lastContactedAt: { type: Date },
    humanControlled: { type: Boolean, default: false },
  },
  { timestamps: true }
);

LeadSchema.plugin(tenancyPlugin);


LeadSchema.index({ workspaceId: 1, campaignId: 1, status: 1 });
LeadSchema.index({ email: 1, workspaceId: 1 }, { unique: true });

export const Lead = mongoose.model<ILead>("Lead", LeadSchema);