import { Router, Request, Response } from 'express';
import { Webhook } from 'svix';
import { BadRequestError } from '@/errors/AppError';
import { handleEmailReply } from '../services/webhook.service';
import logger from '@/config/logger';

const router = Router();

/**
 * POST /api/v1/webhooks/clerk
 * Receives Clerk user lifecycle events, verified via Svix signature.
 *
 * Requires CLERK_WEBHOOK_SECRET env var (whsec_... from Clerk Dashboard → Webhooks).
 * The raw body is captured in app.ts via express.json verify callback.
 */
router.post('/clerk', async (req: Request, res: Response) => {
  const secret = process.env.CLERK_WEBHOOK_SECRET;

  if (!secret) {
    logger.error('CLERK_WEBHOOK_SECRET is not set — webhook rejected');
    return res.status(500).json({ error: 'Webhook secret not configured' });
  }

  // Svix requires the raw body bytes — captured in app.ts verify callback
  const rawBody = (req as any).rawBody as Buffer | undefined;
  if (!rawBody) {
    throw new BadRequestError('Missing raw body for webhook verification');
  }

  const svixId = req.headers['svix-id'] as string;
  const svixTimestamp = req.headers['svix-timestamp'] as string;
  const svixSignature = req.headers['svix-signature'] as string;

  if (!svixId || !svixTimestamp || !svixSignature) {
    throw new BadRequestError('Missing Svix signature headers');
  }

  let event: { type?: string; data?: any };
  try {
    const wh = new Webhook(secret);
    event = wh.verify(rawBody, {
      'svix-id': svixId,
      'svix-timestamp': svixTimestamp,
      'svix-signature': svixSignature,
    }) as typeof event;
  } catch (err) {
    logger.warn({ err }, 'Clerk webhook signature verification failed');
    return res.status(400).json({ error: 'Invalid webhook signature' });
  }

  if (!event.type) {
    throw new BadRequestError('Missing event type');
  }

  logger.info({ eventType: event.type }, 'Webhook received: Clerk');

  if (event.type === 'user.created') {
    logger.info({ clerkUserId: event.data?.id }, 'user.created event received, deferring to tenantGuard auto-provisioning');
    return res.status(200).json({ success: true, received: true });
  }

  return res.status(200).json({ success: true, received: true });
});

/**
 * POST /api/v1/webhooks/:provider
 * Generic webhook receiver for future integrations (Stripe, Twilio, etc.)
 */
router.post('/:provider', (req: Request, res: Response) => {
  const { provider } = req.params as { provider: string };
  logger.info({ provider }, 'Webhook received');
  res.status(200).json({ success: true, received: true });
});

// POST /api/v1/webhooks/email/reply  (from Resend)
router.post('/email/reply', async (req: Request, res: Response) => {
  try {
    const payload = req.body;
    logger.info('[Webhook] Email reply received');
    await handleEmailReply(payload);
    res.status(200).json({ received: true });
  } catch (error: any) {
    logger.error({ err: error }, '[Webhook] Email reply error');
    res.status(500).json({ error: error.message });
  }
});

export default router;
