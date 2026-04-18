import { Request, Response } from 'express';
import { Workflow } from '@revenos/db';
import { v4 as uuidv4 } from 'uuid';

// ── List all flows for the workspace ────────────────────────────────────────
export const listWorkflowsHandler = async (req: Request, res: Response) => {
  const workspaceId = req.user?.workspaceId;
  const workflows = await Workflow.find({ workspaceId })
    .select('workflowId name description nodes edges createdAt updatedAt')
    .sort({ updatedAt: -1 })
    .lean();
  return res.status(200).json({ success: true, data: workflows });
};

// ── Create new flow ──────────────────────────────────────────────────────────
export const createWorkflowHandler = async (req: Request, res: Response) => {
  const workspaceId = req.user?.workspaceId;
  const { name, description, nodes, edges } = req.body;

  const workflow = await Workflow.create({
    workflowId: uuidv4(),
    workspaceId,
    name,
    description,
    nodes,
    edges,
  });

  return res.status(201).json({ success: true, data: workflow });
};

// ── Get single flow by workflowId ────────────────────────────────────────────
export const getWorkflowHandler = async (req: Request, res: Response) => {
  const workspaceId = req.user?.workspaceId;
  const { id } = req.params;

  const workflow = await Workflow.findOne({ workflowId: id, workspaceId }).lean();
  if (!workflow) {
    return res.status(404).json({ success: false, error: 'Workflow not found' });
  }

  return res.status(200).json({ success: true, data: workflow });
};

// ── Update flow ──────────────────────────────────────────────────────────────
export const updateWorkflowHandler = async (req: Request, res: Response) => {
  const workspaceId = req.user?.workspaceId;
  const { id } = req.params;
  const { name, description, nodes, edges } = req.body;

  const update: Record<string, unknown> = {};
  if (name !== undefined) update.name = name;
  if (description !== undefined) update.description = description;
  if (nodes !== undefined) update.nodes = nodes;
  if (edges !== undefined) update.edges = edges;

  const workflow = await Workflow.findOneAndUpdate(
    { workflowId: id, workspaceId },
    { $set: update },
    { new: true }
  );

  if (!workflow) {
    return res.status(404).json({ success: false, error: 'Workflow not found' });
  }

  return res.status(200).json({ success: true, data: workflow });
};

// ── Delete flow ──────────────────────────────────────────────────────────────
export const deleteWorkflowHandler = async (req: Request, res: Response) => {
  const workspaceId = req.user?.workspaceId;
  const { id } = req.params;

  const workflow = await Workflow.findOneAndDelete({ workflowId: id, workspaceId });
  if (!workflow) {
    return res.status(404).json({ success: false, error: 'Workflow not found' });
  }

  return res.status(200).json({ success: true, message: 'Workflow deleted' });
};
