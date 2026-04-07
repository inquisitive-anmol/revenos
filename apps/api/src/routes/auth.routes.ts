import { Router } from 'express';
import { requireAuthGuard } from '@/middleware/auth.middleware';
import { asyncHandler } from '@/utils/asyncHandler';
import { getMeHandler } from '@/controllers/auth.controller';

const router = Router();

import { tenantGuard } from '@/middleware/tenant.middleware';

/**
 * GET /api/v1/auth/me
 * Returns the MongoDB User document and active Workspace for the authenticated Clerk user.
 * Protected by tenantGuard which recursively auto-provisions if missing.
 */
router.get('/me', requireAuthGuard, tenantGuard, asyncHandler(getMeHandler));

export default router;
