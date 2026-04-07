import mongoose, { Schema, Document } from "mongoose";
import { tenancyPlugin } from "../plugins/tenancy.plugin";

export interface ICampaign extends Document {
  workspaceId: string;
  name: string;
  agentIds: mongoose.Types.ObjectId[];
  status: "draft" | "active" | "paused" | "completed";
  settings: {
    icpDescription: string;
    industry: string;
    companySize: string;
    jobTitles: string;
    problemToSolve: string;
    goal: string;
    dailyEmailLimit: number;
    timezone: string;
  };
  metrics: {
    leadsFound: number;
    emailsSent: number;
    repliesReceived: number;
    meetingsBooked: number;
  };
  createdAt: Date;
}

const CampaignSchema = new Schema<ICampaign>(
  {
    workspaceId: {
      type: String,
      required: true,
    },
    name: { type: String, required: true },
    agentIds: [{ type: Schema.Types.ObjectId, ref: "Agent" }],
    status: {
      type: String,
      enum: ["draft", "active", "paused", "completed"],
      default: "draft",
    },
    settings: {
      icpDescription: { type: String, required: true },
      industry: { type: String },
      companySize: { type: String },
      jobTitles: { type: String },
      problemToSolve: { type: String },
      goal: { type: String, default: "Lead Generation" },
      dailyEmailLimit: { type: Number, default: 50 },
      timezone: { type: String, default: "UTC" },
    },
    metrics: {
      leadsFound: { type: Number, default: 0 },
      emailsSent: { type: Number, default: 0 },
      repliesReceived: { type: Number, default: 0 },
      meetingsBooked: { type: Number, default: 0 },
    },
  },
  { timestamps: true }
);

CampaignSchema.plugin(tenancyPlugin);

export const Campaign = mongoose.model<ICampaign>("Campaign", CampaignSchema);