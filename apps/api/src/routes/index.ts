import { Router } from 'express';
import { requireAuthGuard } from '@/middleware/auth.middleware';
import { tenantGuard } from '@/middleware/tenant.middleware';
import {
  authRateLimiter,
  webhookRateLimiter,
} from '@/middleware/rateLimit.middleware';
import authRoutes from './auth.routes';
import leadsRoutes from './leads.routes';
import campaignsRoutes from './campaigns.routes';
import agentsRoutes from './agents.routes';
import analyticsRoutes from './analytics.routes';
import meetingsRoutes from './meetings.routes';
import webhooksRoutes from './webhooks.routes';
import workspaceRoutes from './workspace.routes';

const router = Router();

// ── Public ────────────────────────────────────────────────────────────────────
router.use('/auth', authRateLimiter, authRoutes);

// ── Webhooks (signature-verified, no session auth needed) ─────────────────────
router.use('/webhooks', webhookRateLimiter, webhooksRoutes);

// ── Protected (Clerk session + tenant context required) ───────────────────────
router.use('/workspaces', requireAuthGuard, workspaceRoutes);
router.use('/leads', requireAuthGuard, tenantGuard, leadsRoutes);
router.use('/campaigns', requireAuthGuard, tenantGuard, campaignsRoutes);
router.use('/agents', requireAuthGuard, tenantGuard, agentsRoutes);
router.use('/analytics', requireAuthGuard, tenantGuard, analyticsRoutes);
router.use('/meetings', requireAuthGuard, tenantGuard, meetingsRoutes);

export default router;
