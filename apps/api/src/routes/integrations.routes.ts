import { Router } from 'express';
import { asyncHandler } from '@/utils/asyncHandler';
import {
  getIntegrationsHandler,
  getAuthUrlHandler,
  exchangeCodeHandler,
  updateEmailIntegrationHandler,
  updateCalendarIntegrationHandler,
  updateSlackIntegrationHandler,
} from '@/controllers/integrations.controller';

const router = Router();

// ── Status ─────────────────────────────────────────────────────────────────────
// GET  /integrations            — current integration status (no tokens exposed)
router.get('/', asyncHandler(getIntegrationsHandler));

// ── Nylas OAuth Flow ───────────────────────────────────────────────────────────
// GET  /integrations/auth-url?type=email|calendar  — generates Nylas OAuth URL
// POST /integrations/exchange                       — exchanges code for grant_id
router.get('/auth-url', asyncHandler(getAuthUrlHandler));
router.post('/exchange', asyncHandler(exchangeCodeHandler));

// ── Manual patch (disconnect, or dev-mode connect) ─────────────────────────────
// PATCH /integrations/email     — connect or disconnect email
// PATCH /integrations/calendar  — connect or disconnect calendar
// PATCH /integrations/slack     — connect or disconnect Slack
router.patch('/email', asyncHandler(updateEmailIntegrationHandler));
router.patch('/calendar', asyncHandler(updateCalendarIntegrationHandler));
router.patch('/slack', asyncHandler(updateSlackIntegrationHandler));

export default router;
