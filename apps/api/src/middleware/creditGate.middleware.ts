import { Request, Response, NextFunction } from 'express';
import { CREDIT_COSTS } from '@revenos/billing';
import { getBalance } from '@revenos/billing';
import { CreditTransactionReason } from '@revenos/db';
import { PaymentRequiredError } from '@/errors/AppError';
import { asyncHandler } from '@/utils/asyncHandler';
import logger from '@/config/logger';

// ─────────────────────────────────────────────────────────────────────────────
// req augmentation — downstream handlers can read pre-fetched credit context
// ─────────────────────────────────────────────────────────────────────────────

declare global {
  namespace Express {
    interface Request {
      creditContext?: {
        action: CreditTransactionReason;
        cost: number;
        currentBalance: number;
      };
    }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Factory — creates a middleware for a specific billable action
// ─────────────────────────────────────────────────────────────────────────────

/**
 * creditGate(action)
 *
 * Middleware factory that guards any paid route.
 * Must sit AFTER tenantGuard (requires req.tenant).
 *
 * Flow:
 *   1. Reads workspaceId from req.tenant.id
 *   2. Looks up the credit cost for `action` from CREDIT_COSTS
 *   3. Fetches the wallet balance from the database
 *   4. If balance >= cost → attaches req.creditContext and calls next()
 *   5. If balance < cost  → throws PaymentRequiredError (402)
 *
 * Usage:
 *   router.post('/prospect', tenantGuard, creditGate('LEAD_SOURCED'), handler);
 */
export function creditGate(action: CreditTransactionReason) {
  return asyncHandler(async (
    req: Request,
    _res: Response,
    next: NextFunction,
  ): Promise<void> => {
    const workspaceId = req.tenant?.id;

    if (!workspaceId) {
      // tenantGuard should always run first — this is a programming error
      throw new Error('[creditGate] req.tenant is undefined. Ensure tenantGuard runs before creditGate.');
    }

    const cost = CREDIT_COSTS[action];

    // Actions with zero cost (PLAN_RESET, MANUAL_TOPUP, REFUND) bypass the gate
    if (cost === 0) {
      return next();
    }

    // Fetch current wallet balance
    const { balance } = await getBalance(workspaceId);

    logger.debug(
      { workspaceId, action, cost, balance },
      '[creditGate] balance check',
    );

    // Insufficient credits — reject before the handler runs
    if (balance < cost) {
      throw new PaymentRequiredError(balance, cost, action);
    }

    // Attach credit context for downstream handlers (e.g. to deduct after success)
    req.creditContext = {
      action,
      cost,
      currentBalance: balance,
    };

    next();
  });
}
