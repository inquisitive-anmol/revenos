import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  clerkId: string;
  email: string;
  name: string;
  onboardingComplete: boolean;
  createdAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    clerkId: { type: String, required: true, unique: true },
    email: { type: String, required: true },
    name: { type: String, required: true },
    onboardingComplete: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const User = mongoose.model<IUser>("User", UserSchema);