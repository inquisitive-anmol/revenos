import { Router } from 'express';
import { asyncHandler } from '@/utils/asyncHandler';
import { requireAuthGuard } from '@/middleware/auth.middleware';
import { tenantGuard } from '@/middleware/tenant.middleware';
import {
  listWorkspacesHandler,
  getWorkspaceHandler,
  getInviteInfoHandler,
  acceptInviteHandler,
  regenerateInviteHandler,
} from '@/controllers/workspace.controller';

const router = Router();

// ── Public (invite info only — no auth needed) ────────────────────────────────
router.get('/invite/:token', asyncHandler(getInviteInfoHandler));

// ── Authenticated, no tenant context needed ───────────────────────────────────
// These routes work BEFORE the user has a resolved workspace
router.get('/mine', requireAuthGuard, asyncHandler(listWorkspacesHandler));
router.post('/invite/:token/accept', requireAuthGuard, asyncHandler(acceptInviteHandler));

// ── Authenticated + tenant-scoped ─────────────────────────────────────────────
router.get('/me', requireAuthGuard, asyncHandler(getWorkspaceHandler));
router.post(
  '/:id/invite/regenerate',
  requireAuthGuard,
  tenantGuard,
  asyncHandler(regenerateInviteHandler),
);

export default router;