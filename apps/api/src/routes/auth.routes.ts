import { Router } from 'express';
import { requireAuthGuard } from '@/middleware/auth.middleware';
import { asyncHandler } from '@/utils/asyncHandler';
import { syncUserHandler, getMeHandler } from '@/controllers/auth.controller';

const router = Router();

/**
 * POST /api/v1/auth/sync
 * Idempotent provisioning: creates User, Workspace, WorkspaceMember if they
 * don't exist yet. Called by the frontend right after Clerk sign-in/sign-up.
 * Body: { email, firstName, lastName }
 */
router.post('/sync', requireAuthGuard, asyncHandler(syncUserHandler));

/**
 * GET /api/v1/auth/me
 * Returns the MongoDB User document for the authenticated Clerk user.
 */
router.get('/me', requireAuthGuard, asyncHandler(getMeHandler));

export default router;
