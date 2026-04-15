import { Router } from 'express';
import { z } from 'zod';
import { asyncHandler } from '@/utils/asyncHandler';
import { validate } from '@/middleware/validate.middleware';
import { requireAuthGuard } from '@/middleware/auth.middleware';
import { tenantGuard } from '@/middleware/tenant.middleware';
import {
  createSubscriptionHandler,
  createTopUpHandler,
  getBillingBalanceHandler,
  getTransactionsHandler,
  getCreditPackagesHandler,
  getUsageStatsHandler,
} from '@/controllers/billing.controller';

const router = Router();

// Validation Schemas
const SubscriptionSchema = z.object({
  plan: z.enum(['starter', 'growth', 'scale']),
});

const TopUpSchema = z.object({
  packageId: z.string().min(1, 'Package ID is required'),
});

// ── Protected Actions ─────────────────────────────────────────────────────────
// Requires authentication and workspace context

router.post(
  '/subscribe',
  requireAuthGuard,
  tenantGuard,
  validate({ body: SubscriptionSchema }),
  asyncHandler(createSubscriptionHandler)
);

router.post(
  '/topup',
  requireAuthGuard,
  tenantGuard,
  validate({ body: TopUpSchema }),
  asyncHandler(createTopUpHandler)
);

// ── Data Retrieval ────────────────────────────────────────────────────────────

router.get(
  '/balance',
  requireAuthGuard,
  tenantGuard,
  asyncHandler(getBillingBalanceHandler)
);

router.get(
  '/transactions',
  requireAuthGuard,
  tenantGuard,
  asyncHandler(getTransactionsHandler)
);

router.get(
  '/packages',
  requireAuthGuard,
  tenantGuard,
  asyncHandler(getCreditPackagesHandler)
);

router.get(
  '/usage',
  requireAuthGuard,
  tenantGuard,
  asyncHandler(getUsageStatsHandler)
);

export default router;
