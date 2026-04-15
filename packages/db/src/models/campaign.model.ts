import mongoose, { Schema, Document } from "mongoose";
import { tenancyPlugin } from "../plugins/tenancy.plugin";

export type CampaignStatus = "draft" | "running" | "paused" | "completed";

export interface ICampaign extends Document {
  workspaceId: string;
  name: string;
  agentIds: mongoose.Types.ObjectId[];
  status: CampaignStatus;
  settings: {
    icpDescription: string;
    industry: string;
    companySize: string;
    jobTitles: string;
    problemToSolve: string;
    goal: string;
    dailyEmailLimit: number;
    timezone: string;
    followUpDelayHours: number;
    maxFollowUps: number;
  };
  metrics: {
    leadsFound: number;
    emailsSent: number;
    repliesReceived: number;
    meetingsBooked: number;
  };
  startedAt?: Date;
  completedAt?: Date;
  createdAt: Date;
}

const CampaignSchema = new Schema<ICampaign>(
  {
    workspaceId: { type: String, required: true },
    name: { type: String, required: true },
    agentIds: [{ type: Schema.Types.ObjectId, ref: "Agent" }],
    status: {
      type: String,
      enum: ["draft", "running", "paused", "completed"],
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
      followUpDelayHours: { type: Number, default: 48 },
      maxFollowUps: { type: Number, default: 2 },
    },
    metrics: {
      leadsFound: { type: Number, default: 0 },
      emailsSent: { type: Number, default: 0 },
      repliesReceived: { type: Number, default: 0 },
      meetingsBooked: { type: Number, default: 0 },
    },
    startedAt: { type: Date },
    completedAt: { type: Date },
  },
  { timestamps: true }
);

CampaignSchema.plugin(tenancyPlugin);

CampaignSchema.index({ workspaceId: 1, status: 1 });
CampaignSchema.index({ workspaceId: 1, name: 1 });

export const Campaign = mongoose.model<ICampaign>("Campaign", CampaignSchema);