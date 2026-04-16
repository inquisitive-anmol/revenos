import { Request, Response } from 'express';
import { razorpayService } from '../services/razorpay.service';
import { env } from '../config/env';
import { Billing, CreditPackage, CreditTransaction, CreditWallet } from '@revenos/db';
import { addCredits, resetMonthlyCredits, getBalance } from '@revenos/billing';
import { ok, created, noContent } from '@/utils/response';
import { BadRequestError, UnauthorizedError, NotFoundError } from '@/errors/AppError';
import logger from '@/config/logger';

/**
 * Initiates a Razorpay subscription flow.
 * POST /api/v1/billing/subscribe
 */
export const createSubscriptionHandler = async (req: Request, res: Response) => {
  const workspaceId = req.tenant!.id;
  const { plan } = req.body; // 'starter', 'growth', 'scale'

  if (!['starter', 'growth', 'scale'].includes(plan)) {
    throw new BadRequestError('Invalid plan selected');
  }

  // Map plan to Razorpay Plan ID
  const planId = plan === 'starter' 
    ? env.RAZORPAY_PLAN_STARTER_ID 
    : plan === 'growth' 
      ? env.RAZORPAY_PLAN_GROWTH_ID 
      : env.RAZORPAY_PLAN_SCALE_ID;

  logger.info({ workspaceId, plan, planId }, '[Billing] Creating subscription');

  const subscription = await razorpayService.createSubscription(planId, 12, {
    workspaceId,
    plan,
  });

  // Update billing record with razorpay subscription info if it exists, otherwise create
  await Billing.findOneAndUpdate(
    { workspaceId },
    { 
      $set: { 
        razorpaySubscriptionId: subscription.id,
        plan,
        status: 'trialing' // Initially trialing until verified by webhook
      } 
    },
    { upsert: true }
  );

  return ok(res, {
    subscriptionId: subscription.id,
    shortUrl: (subscription as any).short_url,
  });
};

/**
 * Initiates a top-up credit purchase.
 * POST /api/v1/billing/topup
 */
export const createTopUpHandler = async (req: Request, res: Response) => {
  const workspaceId = req.tenant!.id;
  const { packageId } = req.body;

  const creditPackage = await CreditPackage.findById(packageId);
  if (!creditPackage || !creditPackage.isActive) {
    throw new NotFoundError('Credit package');
  }

  // Razorpay expects amount in paise (INR * 100)
  const amount = Math.round(creditPackage.priceUsd * 100 * 83); // Simple 83 INR/USD conversion for now or use actual

  const order = await razorpayService.createOrder(amount, 'INR', {
    workspaceId,
    packageId: creditPackage._id.toString(),
    credits: creditPackage.credits.toString(),
  });

  return ok(res, {
    orderId: order.id,
    amount: order.amount,
    currency: order.currency,
  });
};

/**
 * Gets billing balance and current plan info.
 * GET /api/v1/billing/balance
 */
export const getBillingBalanceHandler = async (req: Request, res: Response) => {
  const workspaceId = req.tenant!.id;
  
  const [wallet, billing] = await Promise.all([
    getBalance(workspaceId),
    Billing.findOne({ workspaceId })
  ]);

  if (!wallet || !billing) {
    throw new NotFoundError('Billing information not found. This workspace might not be provisioned correctly.');
  }

  return ok(res, {
    balance: wallet.balance,
    lifetimeEarned: wallet.lifetimeEarned,
    lifetimeSpent: wallet.lifetimeSpent,
    plan: billing.plan,
    status: billing.status,
    nextResetAt: billing.nextResetAt,
    monthlyCreditsIncluded: billing.monthlyCreditsIncluded,
    lowCreditAlertSent: billing.lowCreditAlertSent || false,
  });
};

/**
 * Gets paginated transaction history.
 * GET /api/v1/billing/transactions
 */
export const getTransactionsHandler = async (req: Request, res: Response) => {
  const workspaceId = req.tenant!.id;
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const skip = (page - 1) * limit;

  const [transactions, total] = await Promise.all([
    CreditTransaction.find({ workspaceId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    CreditTransaction.countDocuments({ workspaceId })
  ]);

  return ok(res, {
    transactions,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    }
  });
};

/**
 * Gets available credit top-up packages.
 * GET /api/v1/billing/packages
 */
export const getCreditPackagesHandler = async (req: Request, res: Response) => {
  const packages = await CreditPackage.find({ isActive: true }).sort({ credits: 1 });
  return ok(res, packages);
};

/**
 * Gets usage stats for the current month.
 * GET /api/v1/billing/usage
 */
export const getUsageStatsHandler = async (req: Request, res: Response) => {
  const workspaceId = req.tenant!.id;
  
  // Start of current month
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const stats = await CreditTransaction.aggregate([
    {
      $match: {
        workspaceId,
        type: 'debit',
        createdAt: { $gte: startOfMonth }
      }
    },
    {
      $group: {
        _id: '$reason',
        totalAmount: { $sum: '$amount' },
        count: { $sum: 1 }
      }
    },
    {
      $project: {
        reason: '$_id',
        totalAmount: 1,
        count: 1,
        _id: 0
      }
    }
  ]);

  return ok(res, stats);
};

/**
 * Razorpay Webhook Handler
 * POST /api/v1/webhooks/razorpay
 */
export const razorpayWebhookHandler = async (req: Request, res: Response) => {
  const signature = req.headers['x-razorpay-signature'] as string;
  const rawBody = (req as any).rawBody;

  if (!signature || !rawBody) {
    throw new UnauthorizedError('Missing signature or body for webhook');
  }

  const isValid = razorpayService.verifyWebhookSignature(rawBody, signature);
  if (!isValid) {
    logger.warn('[Webhook] Razorpay signature verification failed');
    return res.status(400).json({ error: 'Invalid signature' });
  }

  const payload = req.body;
  const event = payload.event;

  logger.info({ event, id: payload.account_id }, '[Webhook] Razorpay event received');

  try {
    switch (event) {
      case 'subscription.activated':
      case 'subscription.authenticated': {
        const { id: subscriptionId, notes } = payload.payload.subscription.entity;
        const workspaceId = notes.workspaceId;
        
        await Billing.findOneAndUpdate(
          { workspaceId },
          { $set: { razorpaySubscriptionId: subscriptionId, status: 'active' } }
        );
        
        // Initial plan credits reset
        await resetMonthlyCredits(workspaceId);
        logger.info({ workspaceId, subscriptionId }, '[Webhook] Subscription activated');
        break;
      }

      case 'subscription.charged': {
        const { notes } = payload.payload.subscription.entity;
        const workspaceId = notes.workspaceId;
        
        // Monthly credit reset on every successful charge
        await resetMonthlyCredits(workspaceId);
        logger.info({ workspaceId }, '[Webhook] Subscription charged, credits reset');
        break;
      }

      case 'subscription.cancelled':
      case 'subscription.halted': {
        const { notes } = payload.payload.subscription.entity;
        const workspaceId = notes.workspaceId;
        
        await Billing.findOneAndUpdate(
          { workspaceId },
          { $set: { status: 'cancelled' } }
        );
        logger.info({ workspaceId, event }, '[Webhook] Subscription restricted');
        break;
      }

      case 'order.paid': {
        const { id: orderId, notes } = payload.payload.order.entity;
        const workspaceId = notes?.workspaceId;
        const creditsString = notes?.credits;
        const packageId = notes?.packageId;

        logger.info({ orderId, notes, workspaceId, creditsString }, '[Webhook] Processing order.paid');

        if (!workspaceId || !creditsString) {
          logger.warn({ orderId, notes }, '[Webhook] Missing required notes in order.paid');
          break;
        }

        const credits = parseInt(creditsString, 10);
        if (isNaN(credits)) {
          logger.error({ orderId, creditsString }, '[Webhook] Invalid credits value in notes');
          break;
        }

        await addCredits(workspaceId, credits, 'MANUAL_TOPUP', packageId, {
          gateway: 'razorpay',
          orderId,
        });
        
        logger.info({ workspaceId, credits, orderId }, '[Webhook] One-time credits added successfully');
        break;
      }

      case 'payment.failed': {
        const { notes } = payload.payload.payment.entity;
        logger.warn({ notes, error: payload.payload.payment.entity.error_description }, '[Webhook] Payment failed');
        // Future: Send email notification to user
        break;
      }

      default:
        logger.debug({ event }, '[Webhook] Unhandled Razorpay event');
    }
  } catch (err) {
    logger.error({ err, event }, '[Webhook] Error processing Razorpay event');
    // We return 200 even on error to stop Razorpay retries if it's a code error, 
    // but in a production system we might want to return 500 for temporary DB issues.
    return res.status(500).json({ status: 'error', message: 'Internal processing error' });
  }

  return res.status(200).json({ status: 'ok' });
};
