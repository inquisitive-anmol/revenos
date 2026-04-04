import mongoose, { Schema, Document } from "mongoose";

export interface IWorkspace extends Document {
  name: string;
  plan: "free" | "starter" | "pro" | "enterprise";
  seats: number;
  stripeCustomerId?: string;
  settings: {
    timezone: string;
    emailDomain?: string;
  };
  createdAt: Date;
}

const WorkspaceSchema = new Schema<IWorkspace>(
  {
    name: { type: String, required: true },
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
    },
  },
  { timestamps: true }
);

export const Workspace = mongoose.model<IWorkspace>(
  "Workspace",
  WorkspaceSchema
);