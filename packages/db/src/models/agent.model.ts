import mongoose, { Schema, Document } from "mongoose";
import { tenancyPlugin } from "../plugins/tenancy.plugin";

export interface IAgent extends Document {
  workspaceId: string;
  type: "prospector" | "qualifier" | "booker";
  config: {
    icpDescription?: string;
    emailTone?: string;
    followUpDays?: number[];
    qualificationThreshold?: number;
  };
  status: "idle" | "running" | "paused" | "error";
  stats: {
    leadsFound: number;
    emailsSent: number;
    repliesReceived: number;
    meetingsBooked: number;
  };
  createdAt: Date;
}

const AgentSchema = new Schema<IAgent>(
  {
    workspaceId: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ["prospector", "qualifier", "booker"],
      required: true,
    },
    config: {
      icpDescription: { type: String },
      emailTone: { type: String, default: "professional" },
      followUpDays: { type: [Number], default: [0, 3, 7] },
      qualificationThreshold: { type: Number, default: 7 },
    },
    status: {
      type: String,
      enum: ["idle", "running", "paused", "error"],
      default: "idle",
    },
    stats: {
      leadsFound: { type: Number, default: 0 },
      emailsSent: { type: Number, default: 0 },
      repliesReceived: { type: Number, default: 0 },
      meetingsBooked: { type: Number, default: 0 },
    },
  },
  { timestamps: true }
);

AgentSchema.plugin(tenancyPlugin);

export const Agent = mongoose.model<IAgent>("Agent", AgentSchema);