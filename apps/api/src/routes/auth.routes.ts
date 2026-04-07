import { Router } from 'express';
import { requireAuthGuard } from '@/middleware/auth.middleware';
import { asyncHandler } from '@/utils/asyncHandler';
import { getMeHandler } from '@/controllers/auth.controller';

const router = Router();

/**
 * GET /api/v1/auth/me
 * No tenantGuard here — this route handles provisioning itself.
 */
router.get('/me', requireAuthGuard, asyncHandler(getMeHandler));

export default router;