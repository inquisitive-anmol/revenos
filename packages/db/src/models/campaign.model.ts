import mongoose, { Schema, Document } from "mongoose";
import { tenancyPlugin } from "../plugins/tenancy.plugin";

export interface ICampaign extends Document {
  workspaceId: mongoose.Types.ObjectId;
  name: string;
  agentIds: mongoose.Types.ObjectId[];
  status: "draft" | "active" | "paused" | "completed";
  settings: {
    icpDescription: string;
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
      type: Schema.Types.ObjectId,
      ref: "Workspace",
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