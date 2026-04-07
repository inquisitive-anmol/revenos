import mongoose, { Schema, Document } from "mongoose";
import { tenancyPlugin } from "../plugins/tenancy.plugin";

export interface IEmailThread extends Document {
  workspaceId: string;
  leadId: mongoose.Types.ObjectId;
  campaignId: mongoose.Types.ObjectId;
  externalThreadId: string;
  messages: {
    messageId: string;
    direction: "outbound" | "inbound";
    subject: string;
    body: string;
    sentAt: Date;
  }[];
  status: "active" | "replied" | "bounced" | "unsubscribed";
  createdAt: Date;
}

const EmailThreadSchema = new Schema<IEmailThread>(
  {
    workspaceId: {
      type: String,
      required: true,
    },
    leadId: {
      type: Schema.Types.ObjectId,
      ref: "Lead",
      required: true,
    },
    campaignId: {
      type: Schema.Types.ObjectId,
      ref: "Campaign",
      required: true,
    },
    externalThreadId: { type: String, required: true },
    messages: [
      {
        messageId: { type: String, required: true },
        direction: {
          type: String,
          enum: ["outbound", "inbound"],
          required: true,
        },
        subject: { type: String, required: true },
        body: { type: String, required: true },
        sentAt: { type: Date, default: Date.now },
      },
    ],
    status: {
      type: String,
      enum: ["active", "replied", "bounced", "unsubscribed"],
      default: "active",
    },
  },
  { timestamps: true }
);

EmailThreadSchema.plugin(tenancyPlugin);

export const EmailThread = mongoose.model<IEmailThread>(
  "EmailThread",
  EmailThreadSchema
);