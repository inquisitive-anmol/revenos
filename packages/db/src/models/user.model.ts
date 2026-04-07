import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  clerkId: string;
<<<<<<< HEAD
=======
  workspaceId: string;
  role: "owner" | "admin" | "member";
>>>>>>> 88307a7023cfd5e128adccd028003e2459debde3
  email: string;
  name: string;
  onboardingComplete: boolean;
  createdAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    clerkId: { type: String, required: true, unique: true },
<<<<<<< HEAD
=======
    workspaceId: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["owner", "admin", "member"],
      default: "member",
    },
>>>>>>> 88307a7023cfd5e128adccd028003e2459debde3
    email: { type: String, required: true },
    name: { type: String, required: true },
    onboardingComplete: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const User = mongoose.model<IUser>("User", UserSchema);