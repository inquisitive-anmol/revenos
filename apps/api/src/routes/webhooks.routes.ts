import { Router, Request, Response } from 'express';
import { BadRequestError } from '@/errors/AppError';
import { handleEmailReply } from "../services/webhook.service";
import logger from '@/config/logger';

const router = Router();

/**
 * POST /api/v1/webhooks/clerk
 * Receives Clerk user lifecycle events (user.created, user.updated, etc.)
 * TODO: Verify Svix signature using WEBHOOK_SECRET env var before processing.
 */
router.post('/clerk', (req: Request, res: Response) => {
  const event = req.body as { type?: string };

  if (!event.type) {
    throw new BadRequestError('Missing event type');
  }

  logger.info({ eventType: event.type }, 'Webhook received: Clerk');

  // TODO: Route to event handler based on event.type
  // e.g. if (event.type === 'user.created') await syncClerkUser(event.data);

  res.status(200).json({ success: true, received: true });
});

/**
 * POST /api/v1/webhooks/:provider
 * Generic webhook receiver for future integrations (Stripe, Twilio, etc.)
 */
router.post('/:provider', (req: Request, res: Response) => {
  const { provider } = req.params as { provider: string };
  logger.info({ provider }, 'Webhook received');

  // TODO: Route to provider-specific handler
  res.status(200).json({ success: true, received: true });
});

// from resend
// POST /api/v1/webhooks/email/reply
router.post("/email/reply", async (req: Request, res: Response) => {
  try {
    const payload = req.body;
    console.log("[Webhook] Email reply received:", JSON.stringify(payload));
    await handleEmailReply(payload);
    res.status(200).json({ received: true });
  } catch (error: any) {
    console.error("[Webhook] Error:", error.message);
    res.status(500).json({ error: error.message });
  }
});

export default router;
