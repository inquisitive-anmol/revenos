import { Router } from 'express';
import { requireAuthGuard } from '@/middleware/auth.middleware';
import { tenantGuard } from '@/middleware/tenant.middleware';
import {
  authRateLimiter,
  webhookRateLimiter,
  generalRateLimiter,
} from '@/middleware/rateLimit.middleware';
import authRoutes from './auth.routes';
import leadsRoutes from './leads.routes';
import campaignsRoutes from './campaigns.routes';
import agentsRoutes from './agents.routes';
import analyticsRoutes from './analytics.routes';
import meetingsRoutes from './meetings.routes';
import webhooksRoutes from './webhooks.routes';
import workspaceRoutes from './workspace.routes';
import billingRoutes from './billing.routes';
import workflowsRoutes from './workflows.routes';
import integrationsRoutes from './integrations.routes';

const router = Router();

// ── Public ────────────────────────────────────────────────────────────────────
router.use('/auth', generalRateLimiter, authRoutes);

// ── Webhooks (signature-verified, no session auth needed) ─────────────────────
router.use('/webhooks', webhookRateLimiter, webhooksRoutes);

// ── Protected (Clerk session + tenant context required) ───────────────────────
router.use('/workspaces', generalRateLimiter, requireAuthGuard, workspaceRoutes);
router.use('/leads', generalRateLimiter, requireAuthGuard, tenantGuard, leadsRoutes);
router.use('/campaigns', generalRateLimiter, requireAuthGuard, tenantGuard, campaignsRoutes);
router.use('/agents', generalRateLimiter, requireAuthGuard, tenantGuard, agentsRoutes);
router.use('/analytics', generalRateLimiter, requireAuthGuard, tenantGuard, analyticsRoutes);
router.use('/meetings', generalRateLimiter, requireAuthGuard, tenantGuard, meetingsRoutes);
router.use('/workflows', generalRateLimiter, requireAuthGuard, tenantGuard, workflowsRoutes);
router.use('/integrations', generalRateLimiter, requireAuthGuard, tenantGuard, integrationsRoutes);
router.use('/billing', generalRateLimiter, billingRoutes);

export default router;
