import mongoose, { Schema, Document } from "mongoose";
import { tenancyPlugin } from "../plugins/tenancy.plugin";

export type BillingPlan = "free" | "starter" | "growth" | "scale";
export type BillingStatus = "active" | "past_due" | "cancelled" | "trialing";

export interface IBilling extends Document {
  workspaceId: string;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  razorpayCustomerId?: string;
  razorpaySubscriptionId?: string;
  plan: BillingPlan;
  status: BillingStatus;
  monthlyCreditsIncluded: number;
  currentPeriodEnd: Date;
  nextResetAt: Date;
  lowCreditAlertSent: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const BillingSchema = new Schema<IBilling>(
  {
    workspaceId: { type: String, required: true },
    stripeCustomerId: { type: String },
    stripeSubscriptionId: { type: String },
    razorpayCustomerId: { type: String },
    razorpaySubscriptionId: { type: String },
    plan: {
      type: String,
      enum: ["starter", "growth", "scale"],
      default: "starter",
    },
    status: {
      type: String,
      enum: ["active", "past_due", "cancelled", "trialing"],
      default: "trialing",
    },
    monthlyCreditsIncluded: { type: Number, default: 0 },
    currentPeriodEnd: { type: Date, required: true },
    nextResetAt: { type: Date, required: true },
    lowCreditAlertSent: { type: Boolean, default: false },
  },
  { timestamps: true }
);

BillingSchema.plugin(tenancyPlugin);

// One billing record per workspace
BillingSchema.index({ workspaceId: 1 }, { unique: true });

export const Billing = mongoose.model<IBilling>("Billing", BillingSchema);
