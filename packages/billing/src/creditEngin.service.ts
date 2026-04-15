import mongoose from "mongoose";
import {
  CreditWallet,
  CreditTransaction,
  Billing,
  CreditTransactionReason,
} from "@revenos/db";
import { creditAlertQueue } from "@revenos/queue";
import {
  CreditBalanceResult,
  CreditOperationResult,
  InsufficientCreditsError,
} from "./types/billing.types";
import { PLAN_MONTHLY_CREDITS } from "./constants/plan";

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Returns the wallet for workspaceId, creating one with zero balance if it
 * doesn't exist yet (first-time initialisation is idempotent via upsert).
 */
async function getOrCreateWallet(
  workspaceId: string,
  session?: mongoose.ClientSession
) {
  const opts = session ? { session } : {};
  const wallet = await CreditWallet.findOneAndUpdate(
    { workspaceId },
    { $setOnInsert: { workspaceId, balance: 0, lifetimeEarned: 0, lifetimeSpent: 0 } },
    { upsert: true, new: true, ...opts }
  );
  if (!wallet) {
    throw new Error(`[CreditEngine] Could not get or create wallet for workspace ${workspaceId}`);
  }
  return wallet;
}

// ─────────────────────────────────────────────────────────────────────────────
// Public API
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Returns the current credit balance for a workspace.
 */
export async function getBalance(workspaceId: string): Promise<CreditBalanceResult> {
  const wallet = await getOrCreateWallet(workspaceId);
  return {
    workspaceId,
    balance: wallet.balance,
    lifetimeEarned: wallet.lifetimeEarned,
    lifetimeSpent: wallet.lifetimeSpent,
  };
}

// ─────────────────────────────────────────────────────────────────────────────

/**
 * Deducts credits atomically inside a MongoDB session.
 * Throws InsufficientCreditsError if the wallet balance would go below zero.
 */
export async function deductCredits(
  workspaceId: string,
  amount: number,
  reason: CreditTransactionReason,
  referenceId?: string,
  metadata: Record<string, unknown> = {}
): Promise<CreditOperationResult> {
  if (amount <= 0) {
    throw new Error("[CreditEngine] deductCredits: amount must be a positive number");
  }

  const session = await mongoose.startSession();

  try {
    let result!: CreditOperationResult;

    await session.withTransaction(async () => {
      // 1. Lock the wallet inside the transaction
      const wallet = await getOrCreateWallet(workspaceId, session);
      const balanceBefore = wallet.balance;

      // 2. Guard: insufficient funds
      if (balanceBefore < amount) {
        throw new InsufficientCreditsError(balanceBefore, amount);
      }

      const balanceAfter = balanceBefore - amount;

      // 3. Update wallet atomically
      await CreditWallet.findOneAndUpdate(
        { workspaceId },
        {
          $inc: {
            balance: -amount,
            lifetimeSpent: amount,
          },
        },
        { session }
      );

      // 4. Append immutable transaction log
      await CreditTransaction.create(
        [
          {
            workspaceId,
            type: "debit" as const,
            amount,
            reason,
            referenceId,
            balanceBefore,
            balanceAfter,
            metadata,
            createdAt: new Date(),
          },
        ],
        { session }
      );

      result = {
        workspaceId,
        previousBalance: balanceBefore,
        newBalance: balanceAfter,
        amount,
        reason,
      };
    });

    // ── Post-transaction: Check for low balance alert ─────────────────────
    // Logic: If balance < 20% of monthly allocation and we haven't alerted yet.
    try {
      const billing = await Billing.findOne({ workspaceId });
      if (billing && !billing.lowCreditAlertSent) {
        const allocation = PLAN_MONTHLY_CREDITS[billing.plan];
        if (allocation > 0 && result.newBalance < 0.2 * allocation) {
          // Trigger alert job
          await creditAlertQueue.add("low-balance-alert", {
            workspaceId,
            currentBalance: result.newBalance,
            monthlyAllocation: allocation,
            thresholdPercent: 20
          });

          // Mark as alerted for this cycle
          await Billing.updateOne(
            { _id: billing._id },
            { $set: { lowCreditAlertSent: true } }
          );
        }
      }
    } catch (alertError) {
      console.error("[CreditEngine] Failed to trigger low credit alert:", alertError);
    }

    return result;
  } finally {
    await session.endSession();
  }
}

// ─────────────────────────────────────────────────────────────────────────────

/**
 * Adds credits to a workspace wallet atomically.
 */
export async function addCredits(
  workspaceId: string,
  amount: number,
  reason: CreditTransactionReason,
  referenceId?: string,
  metadata: Record<string, unknown> = {}
): Promise<CreditOperationResult> {
  if (amount <= 0) {
    throw new Error("[CreditEngine] addCredits: amount must be a positive number");
  }

  const session = await mongoose.startSession();

  try {
    let result!: CreditOperationResult;

    await session.withTransaction(async () => {
      // 1. Get (or initialise) wallet inside transaction
      const wallet = await getOrCreateWallet(workspaceId, session);
      const balanceBefore = wallet.balance;
      const balanceAfter = balanceBefore + amount;

      // 2. Increment wallet
      await CreditWallet.findOneAndUpdate(
        { workspaceId },
        {
          $inc: {
            balance: amount,
            lifetimeEarned: amount,
          },
        },
        { session }
      );

      // 3. Append immutable transaction log
      await CreditTransaction.create(
        [
          {
            workspaceId,
            type: "credit" as const,
            amount,
            reason,
            referenceId,
            balanceBefore,
            balanceAfter,
            metadata,
            createdAt: new Date(),
          },
        ],
        { session }
      );

      result = {
        workspaceId,
        previousBalance: balanceBefore,
        newBalance: balanceAfter,
        amount,
        reason,
      };
    });

    return result;
  } finally {
    await session.endSession();
  }
}

// ─────────────────────────────────────────────────────────────────────────────

/**
 * Called by the billing cron job at the start of each billing cycle.
 * Looks up the workspace's plan, fetches the monthly allocation,
 * and calls addCredits with reason PLAN_RESET.
 */
export async function resetMonthlyCredits(
  workspaceId: string
): Promise<CreditOperationResult> {
  // Look up billing record to get the current plan
  const billing = await Billing.findOne({ workspaceId });
  if (!billing) {
    throw new Error(
      `[CreditEngine] resetMonthlyCredits: no Billing record found for workspace ${workspaceId}`
    );
  }

  const allocation = PLAN_MONTHLY_CREDITS[billing.plan] ?? 0;

  const result = await addCredits(
    workspaceId,
    allocation,
    "PLAN_RESET",
    billing._id.toString(),
    { plan: billing.plan, cycleStart: new Date().toISOString() }
  );

  // Update nextResetAt to the next calendar month
  const nextReset = new Date();
  nextReset.setMonth(nextReset.getMonth() + 1);
  nextReset.setDate(1);
  nextReset.setHours(0, 0, 0, 0);

  await Billing.findOneAndUpdate(
    { workspaceId },
    { $set: { nextResetAt: nextReset, lowCreditAlertSent: false } }
  );

  return result;
}
