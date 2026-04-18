import { Router } from 'express';
import { z } from 'zod';
import { asyncHandler } from '@/utils/asyncHandler';
import { validate } from '@/middleware/validate.middleware';
import {
  createWorkflowHandler,
  listWorkflowsHandler,
  getWorkflowHandler,
  updateWorkflowHandler,
  deleteWorkflowHandler,
} from '@/controllers/workflows.controller';

const router = Router();

const WorkflowNodeSchema = z.object({
  id: z.string(),
  type: z.enum(['prospector', 'qualifier', 'booker', 'human', 'condition']),
  position: z.object({ x: z.number(), y: z.number() }),
  config: z.record(z.unknown()).default({}),
});

const WorkflowEdgeSchema = z.object({
  id: z.string(),
  source: z.string(),
  target: z.string(),
  condition: z.enum(['true', 'false']).optional(),
});

const CreateWorkflowSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  nodes: z.array(WorkflowNodeSchema),
  edges: z.array(WorkflowEdgeSchema),
});

const UpdateWorkflowSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  nodes: z.array(WorkflowNodeSchema).optional(),
  edges: z.array(WorkflowEdgeSchema).optional(),
});

// GET  /workflows           → list all flows for workspace
// POST /workflows           → create new flow
// GET  /workflows/:id       → get single flow by workflowId
// PUT  /workflows/:id       → update flow
// DELETE /workflows/:id     → delete flow

router.get('/', asyncHandler(listWorkflowsHandler));
router.post('/', validate({ body: CreateWorkflowSchema }), asyncHandler(createWorkflowHandler));
router.get('/:id', validate({ params: z.object({ id: z.string() }) }), asyncHandler(getWorkflowHandler));
router.put('/:id', validate({ params: z.object({ id: z.string() }), body: UpdateWorkflowSchema }), asyncHandler(updateWorkflowHandler));
router.delete('/:id', validate({ params: z.object({ id: z.string() }) }), asyncHandler(deleteWorkflowHandler));

export default router;
