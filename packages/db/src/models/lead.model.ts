import mongoose, { Schema, Document } from "mongoose";
import { tenancyPlugin } from "../plugins/tenancy.plugin";

export interface ILead extends Document {
  workspaceId: mongoose.Types.ObjectId;
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
  status:
  | "prospecting"
  | "contacted"
  | "qualified"
  | "disqualified"
  | "meeting_booked"
  | "closed";
  enrichmentData: Record<string, unknown>;
  researchNotes?: string;
  tags: string[];
  humanControlled: boolean;
  createdAt: Date;
}

const LeadSchema = new Schema<ILead>(
  {
    workspaceId: {
      type: Schema.Types.ObjectId,
      ref: "Workspace",
      required: true,
    },
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
        "prospecting",
        "contacted",
        "qualified",
        "disqualified",
        "meeting_booked",
        "closed",
      ],
      default: "prospecting",
    },
    enrichmentData: { type: Schema.Types.Mixed, default: {} },
    researchNotes: { type: String },
    tags: [{ type: String }],
    humanControlled: { type: Boolean, default: false },
  },
  { timestamps: true }
);

LeadSchema.plugin(tenancyPlugin);

export const Lead = mongoose.model<ILead>("Lead", LeadSchema);