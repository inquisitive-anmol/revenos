import mongoose, { Schema, Document } from "mongoose";
import { tenancyPlugin } from "../plugins/tenancy.plugin";

export interface ICreditWallet extends Document {
  workspaceId: string;
  balance: number;
  lifetimeEarned: number;
  lifetimeSpent: number;
  updatedAt: Date;
}

const CreditWalletSchema = new Schema<ICreditWallet>(
  {
    workspaceId: { type: String, required: true },
    balance: { type: Number, default: 0, min: 0 },
    lifetimeEarned: { type: Number, default: 0, min: 0 },
    lifetimeSpent: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true }
);

CreditWalletSchema.plugin(tenancyPlugin);

// One wallet per workspace
CreditWalletSchema.index({ workspaceId: 1 }, { unique: true });

export const CreditWallet = mongoose.model<ICreditWallet>(
  "CreditWallet",
  CreditWalletSchema
);
