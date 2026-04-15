import mongoose, { Schema, Document } from "mongoose";

export interface ICreditPackage extends Document {
  name: string;
  credits: number;
  priceUsd: number;
  stripePriceId: string;
  isActive: boolean;
  isPopular: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CreditPackageSchema = new Schema<ICreditPackage>(
  {
    name: { type: String, required: true },
    credits: { type: Number, required: true, min: 1 },
    priceUsd: { type: Number, required: true, min: 0 },
    stripePriceId: { type: String, required: true },
    isActive: { type: Boolean, default: true },
    isPopular: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Global model, no tenancyPlugin needed
CreditPackageSchema.index({ isActive: 1, priceUsd: 1 });

export const CreditPackage = mongoose.model<ICreditPackage>(
  "CreditPackage",
  CreditPackageSchema
);
