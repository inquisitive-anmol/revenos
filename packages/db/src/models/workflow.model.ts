import mongoose, { Schema, Document } from "mongoose";

export interface IWorkflowNode {
  id: string;
  type: "prospector" | "qualifier" | "booker" | "human" | "condition";
  position: { x: number; y: number };
  config: Record<string, unknown>;
}

export interface IWorkflowEdge {
  id: string;
  source: string;
  target: string;
  condition?: "true" | "false";
}

export interface IWorkflow extends Document {
  workflowId: string;          // uuid — stable public id for client references
  workspaceId: string;
  name: string;                // user-facing name e.g. "Q4 Enterprise Outreach"
  description?: string;
  nodes: IWorkflowNode[];
  edges: IWorkflowEdge[];
  createdAt: Date;
  updatedAt: Date;
}

const WorkflowNodeSchema = new Schema<IWorkflowNode>(
  {
    id: { type: String, required: true },
    type: {
      type: String,
      required: true,
      enum: ["prospector", "qualifier", "booker", "human", "condition"],
    },
    position: {
      x: { type: Number, required: true },
      y: { type: Number, required: true },
    },
    config: { type: Schema.Types.Mixed, default: {} },
  },
  { _id: false }
);

const WorkflowEdgeSchema = new Schema<IWorkflowEdge>(
  {
    id: { type: String, required: true },
    source: { type: String, required: true },
    target: { type: String, required: true },
    condition: { type: String, enum: ["true", "false"] },
  },
  { _id: false }
);

const WorkflowSchema = new Schema<IWorkflow>(
  {
    workflowId: { type: String, required: true, unique: true },
    workspaceId: { type: String, required: true, index: true },
    name: { type: String, required: true },
    description: { type: String },
    nodes: { type: [WorkflowNodeSchema], required: true },
    edges: { type: [WorkflowEdgeSchema], required: true },
  },
  { timestamps: true }
);

export const Workflow = mongoose.model<IWorkflow>("Workflow", WorkflowSchema);
