import mongoose, { Schema, Document } from "mongoose";
import { tenancyPlugin } from "../plugins/tenancy.plugin";

export interface IAgentLog extends Document {
  workspaceId: mongoose.Types.ObjectId;
  agentId: mongoose.Types.ObjectId;
  campaignId: mongoose.Types.ObjectId;
  event: string;
  data: Record<string, unknown>;
  timestamp: Date;
}

const AgentLogSchema = new Schema<IAgentLog>(
  {
    workspaceId: {
      type: Schema.Types.ObjectId,
      ref: "Workspace",
      required: true,
    },
    agentId: {
      type: Schema.Types.ObjectId,
      ref: "Agent",
      required: true,
    },
    campaignId: {
      type: Schema.Types.ObjectId,
      ref: "Campaign",
      required: true,
    },
    event: { type: String, required: true },
    data: { type: Schema.Types.Mixed, default: {} },
    timestamp: { type: Date, default: Date.now },
  }
  // No timestamps: true — this collection is append-only, timestamp is manual
);

AgentLogSchema.plugin(tenancyPlugin);

export const AgentLog = mongoose.model<IAgentLog>("AgentLog", AgentLogSchema);