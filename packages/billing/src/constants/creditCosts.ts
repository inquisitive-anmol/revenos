import { CreditTransactionReason } from "@revenos/db";

/**
 * Credit cost per billable agent action.
 *
 * This is the single place to change costs — nothing else needs updating.
 * Deducted via deductCredits() before the action runs.
 */
export const CREDIT_COSTS: Record<CreditTransactionReason, number> = {
  LEAD_SOURCED: 10,
  LEAD_ENRICHED_HUNTER: 2,
  LEAD_ENRICHED_SERP: 1,
  EMAIL_SENT: 1,
  AI_AGENT_RUN: 3,
  MANUAL_TOPUP: 0,   // additive — no cost
  PLAN_RESET: 0,     // additive — no cost
  REFUND: 0,         // additive — no cost
};
