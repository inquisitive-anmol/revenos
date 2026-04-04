import { Router } from 'express';
import { z } from 'zod';
import { asyncHandler } from '@/utils/asyncHandler';
import { validate } from '@/middleware/validate.middleware';
import {
  createWorkspaceHandler,
  getWorkspaceHandler,
} from '@/controllers/workspace.controller';

const router = Router();

const CreateWorkspaceSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  userName: z.string().min(2, 'User name must be at least 2 characters'),
});

router.post(
  '/',
  validate({ body: CreateWorkspaceSchema }),
  asyncHandler(createWorkspaceHandler)
);

router.get('/me', asyncHandler(getWorkspaceHandler));

export default router;