import mongoose, { Schema, Document } from "mongoose";

export interface IWorkspaceIntegrations {
  email?: {
    provider: 'google' | 'microsoft';  // which OAuth provider
    email: string;                      // connected mailbox address
    nylasGrantId?: string;              // Nylas grant ID for API calls
    connectedAt: Date;
  };
  calendar?: {
    provider: 'google' | 'microsoft';
    calendarId?: string;
    nylasGrantId?: string;
    connectedAt: Date;
  };
  slack?: {
    webhookUrl: string;
    channel: string;
    connectedAt: Date;
  };
}

export interface IWorkspace extends Document {
  clerkOwnerId: string;
  name: string;
  plan: "free" | "starter" | "pro" | "enterprise";
  seats: number;
  inviteToken: string;
  stripeCustomerId?: string;
  integrations: IWorkspaceIntegrations;
  settings: {
    timezone: string;
    emailDomain?: string;
    slackWebhookUrl?: string;
  };
  createdAt: Date;
}

const WorkspaceSchema = new Schema<IWorkspace>(
  {
    clerkOwnerId: { type: String, required: true, index: true },
    name: { type: String, required: true },
    inviteToken: { type: String, required: true, unique: true },
    plan: {
      type: String,
      enum: ["free", "starter", "pro", "enterprise"],
      default: "free",
    },
    seats: { type: Number, default: 1 },
    stripeCustomerId: { type: String },
    settings: {
      timezone: { type: String, default: "UTC" },
      emailDomain: { type: String },
      slackWebhookUrl: { type: String },
    },
    integrations: {
      email: {
        provider: { type: String, enum: ['google', 'microsoft'] },
        email: { type: String },
        nylasGrantId: { type: String },
        connectedAt: { type: Date },
      },
      calendar: {
        provider: { type: String, enum: ['google', 'microsoft'] },
        calendarId: { type: String },
        nylasGrantId: { type: String },
        connectedAt: { type: Date },
      },
      slack: {
        webhookUrl: { type: String },
        channel: { type: String },
        connectedAt: { type: Date },
      },
    },
  },
  { timestamps: true }
);

export const Workspace = mongoose.model<IWorkspace>(
  "Workspace",
  WorkspaceSchema
);