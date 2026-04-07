import mongoose, { Schema, Document } from "mongoose";
import { tenancyPlugin } from "../plugins/tenancy.plugin";

export interface IMeeting extends Document {
  workspaceId: string;
  leadId: mongoose.Types.ObjectId;
  campaignId: mongoose.Types.ObjectId;
  calendarEventId?: string;
  scheduledAt: Date;
  outcome?: "completed" | "no_show" | "rescheduled" | "cancelled";
  createdAt: Date;
}

const MeetingSchema = new Schema<IMeeting>(
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
    calendarEventId: { type: String },
    scheduledAt: { type: Date, required: true },
    outcome: {
      type: String,
      enum: ["completed", "no_show", "rescheduled", "cancelled"],
    },
  },
  { timestamps: true }
);

MeetingSchema.plugin(tenancyPlugin);

export const Meeting = mongoose.model<IMeeting>("Meeting", MeetingSchema);