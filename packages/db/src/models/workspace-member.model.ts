import mongoose, { Schema, Document } from "mongoose";

export interface IWorkspaceMember extends Document {
  workspaceId: mongoose.Types.ObjectId;
  clerkUserId: string;
  role: "owner" | "admin" | "member";
  joinedAt: Date;
}

const WorkspaceMemberSchema = new Schema<IWorkspaceMember>(
  {
    workspaceId: {
      type: Schema.Types.ObjectId,
      ref: "Workspace",
      required: true,
    },
    clerkUserId: { type: String, required: true },
    role: {
      type: String,
      enum: ["owner", "admin", "member"],
      default: "member",
    },
    joinedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// A user can only have one membership per workspace
WorkspaceMemberSchema.index({ workspaceId: 1, clerkUserId: 1 }, { unique: true });
// Fast lookup: "which workspaces is this user in?"
WorkspaceMemberSchema.index({ clerkUserId: 1 });

export const WorkspaceMember = mongoose.model<IWorkspaceMember>(
  "WorkspaceMember",
  WorkspaceMemberSchema
);
