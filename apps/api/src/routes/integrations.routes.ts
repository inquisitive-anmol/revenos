import { Router } from 'express';
import { asyncHandler } from '@/utils/asyncHandler';
import {
  getIntegrationsHandler,
  updateEmailIntegrationHandler,
  updateCalendarIntegrationHandler,
  updateSlackIntegrationHandler,
} from '@/controllers/integrations.controller';

const router = Router();

// GET  /integrations            — status of all integrations
// PATCH /integrations/email     — connect or disconnect email
// PATCH /integrations/calendar  — connect or disconnect calendar
// PATCH /integrations/slack     — connect or disconnect Slack

router.get('/', asyncHandler(getIntegrationsHandler));
router.patch('/email', asyncHandler(updateEmailIntegrationHandler));
router.patch('/calendar', asyncHandler(updateCalendarIntegrationHandler));
router.patch('/slack', asyncHandler(updateSlackIntegrationHandler));

export default router;
