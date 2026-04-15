import { CreditTransactionReason } from "@revenos/db";

// ─────────────────────────────────────────────────────────────
// Return types
// ─────────────────────────────────────────────────────────────

export interface CreditBalanceResult {
  workspaceId: string;
  balance: number;
  lifetimeEarned: number;
  lifetimeSpent: number;
}

export interface CreditOperationResult {
  workspaceId: string;
  previousBalance: number;
  newBalance: number;
  amount: number;
  reason: CreditTransactionReason;
}

// ─────────────────────────────────────────────────────────────
// Errors
// ─────────────────────────────────────────────────────────────

export class InsufficientCreditsError extends Error {
  public readonly currentBalance: number;
  public readonly required: number;

  constructor(currentBalance: number, required: number) {
    super(
      `Insufficient credits: wallet has ${currentBalance} but ${required} are required.`
    );
    this.name = "InsufficientCreditsError";
    this.currentBalance = currentBalance;
    this.required = required;
  }
}
