import mongoose, { Schema, Document } from "mongoose";
import { tenancyPlugin } from "../plugins/tenancy.plugin";

export interface IProposedSlot {
  start: string; // ISO string
  end: string;   // ISO string
}

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
  status:
    | "active"
    | "replied"
    | "bounced"
    | "unsubscribed"
    | "awaiting_slot_reply"
    | "meeting_booked"
    | "closed";

  // Populated by Booker Phase 1
  proposedSlots?: IProposedSlot[];
  bookerMeta?: {
    leadEmail: string;
    leadName: string;
    calendarId: string;   // Nylas calendar ID to book on
    durationMins: number; // e.g. 30
  };

  // Populated by Booker Phase 2 after booking
  meetingDetails?: {
    eventId: string;       // Nylas/Google Calendar event ID
    confirmedSlot: IProposedSlot;
    calendarLink?: string; // Google Meet / calendar link if available
  };

  createdAt: Date;
}

const EmailThreadSchema = new Schema<IEmailThread>(
  {
    workspaceId: { type: String, required: true },
    leadId: { type: Schema.Types.ObjectId, ref: "Lead", required: true },
    campaignId: { type: Schema.Types.ObjectId, ref: "Campaign", required: true },
    externalThreadId: { type: String, required: true },
    messages: [
      {
        messageId: { type: String, required: true },
        direction: { type: String, enum: ["outbound", "inbound"], required: true },
        subject: { type: String, required: true },
        body: { type: String, required: true },
        sentAt: { type: Date, default: Date.now },
      },
    ],
    status: {
      type: String,
      enum: [
        "active",
        "replied",
        "bounced",
        "unsubscribed",
        "awaiting_slot_reply",
        "meeting_booked",
        "closed",
      ],
      default: "active",
    },

    proposedSlots: [
      {
        start: { type: String },
        end: { type: String },
      },
    ],

    bookerMeta: {
      leadEmail: { type: String },
      leadName: { type: String },
      calendarId: { type: String },
      durationMins: { type: Number, default: 30 },
    },

    meetingDetails: {
      eventId: { type: String },
      confirmedSlot: {
        start: { type: String },
        end: { type: String },
      },
      calendarLink: { type: String },
    },
  },
  { timestamps: true }
);

EmailThreadSchema.plugin(tenancyPlugin);

export const EmailThread = mongoose.model<IEmailThread>(
  "EmailThread",
  EmailThreadSchema
);