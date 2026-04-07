import mongoose, { Schema, Document } from "mongoose";
import { tenancyPlugin } from "../plugins/tenancy.plugin";

export interface IUser extends Document {
  clerkId: string;
  workspaceId: string;
  role: "owner" | "admin" | "member";
  email: string;
  name: string;
  onboardingComplete: boolean;
  createdAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    clerkId: { type: String, required: true, unique: true },
    workspaceId: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["owner", "admin", "member"],
      default: "member",
    },
    email: { type: String, required: true },
    name: { type: String, required: true },
    onboardingComplete: { type: Boolean, default: false },
  },
  { timestamps: true }
);

UserSchema.plugin(tenancyPlugin);

export const User = mongoose.model<IUser>("User", UserSchema);