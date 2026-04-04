import mongoose, { Schema, Document } from "mongoose";
import { tenancyPlugin } from "../plugins/tenancy.plugin";

export interface IConversation extends Document {
  workspaceId: mongoose.Types.ObjectId;
  leadId: mongoose.Types.ObjectId;
  agentId: mongoose.Types.ObjectId;
  messages: {
    role: "agent" | "lead";
    content: string;
    sentAt: Date;
  }[];
  handoffData?: Record<string, unknown>;
  outcome?: "qualified" | "disqualified" | "meeting_booked" | "human_takeover";
  createdAt: Date;
}

const ConversationSchema = new Schema<IConversation>(
  {
    workspaceId: {
      type: Schema.Types.ObjectId,
      ref: "Workspace",
      required: true,
    },
    leadId: {
      type: Schema.Types.ObjectId,
      ref: "Lead",
      required: true,
    },
    agentId: {
      type: Schema.Types.ObjectId,
      ref: "Agent",
      required: true,
    },
    messages: [
      {
        role: { type: String, enum: ["agent", "lead"], required: true },
        content: { type: String, required: true },
        sentAt: { type: Date, default: Date.now },
      },
    ],
    handoffData: { type: Schema.Types.Mixed },
    outcome: {
      type: String,
      enum: [
        "qualified",
        "disqualified",
        "meeting_booked",
        "human_takeover",
      ],
    },
  },
  { timestamps: true }
);

ConversationSchema.plugin(tenancyPlugin);

export const Conversation = mongoose.model<IConversation>(
  "Conversation",
  ConversationSchema
);