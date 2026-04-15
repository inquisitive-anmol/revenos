import mongoose, { Schema, Document } from "mongoose";
import { tenancyPlugin } from "../plugins/tenancy.plugin";

export type CreditTransactionType = "debit" | "credit";

export type CreditTransactionReason =
  | "LEAD_SOURCED"
  | "LEAD_ENRICHED_HUNTER"
  | "LEAD_ENRICHED_SERP"
  | "EMAIL_SENT"
  | "AI_AGENT_RUN"
  | "MANUAL_TOPUP"
  | "PLAN_RESET"
  | "REFUND";

export interface ICreditTransaction extends Document {
  workspaceId: string;
  type: CreditTransactionType;
  amount: number;
  reason: CreditTransactionReason;
  referenceId?: string;
  balanceBefore: number;
  balanceAfter: number;
  metadata: Record<string, unknown>;
  createdAt: Date;
}

const CreditTransactionSchema = new Schema<ICreditTransaction>(
  {
    workspaceId: { type: String, required: true },
    type: {
      type: String,
      enum: ["debit", "credit"],
      required: true,
    },
    amount: { type: Number, required: true, min: 0 },
    reason: {
      type: String,
      enum: [
        "LEAD_SOURCED",
        "LEAD_ENRICHED_HUNTER",
        "LEAD_ENRICHED_SERP",
        "EMAIL_SENT",
        "AI_AGENT_RUN",
        "MANUAL_TOPUP",
        "PLAN_RESET",
        "REFUND",
      ],
      required: true,
    },
    referenceId: { type: String },
    balanceBefore: { type: Number, required: true },
    balanceAfter: { type: Number, required: true },
    metadata: { type: Schema.Types.Mixed, default: {} },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: false }
);

CreditTransactionSchema.plugin(tenancyPlugin);

// Efficient pagination and workspace queries
CreditTransactionSchema.index({ workspaceId: 1, createdAt: -1 });

export const CreditTransaction = mongoose.model<ICreditTransaction>(
  "CreditTransaction",
  CreditTransactionSchema
);
