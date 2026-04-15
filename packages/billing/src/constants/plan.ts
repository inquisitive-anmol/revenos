import { BillingPlan } from "@revenos/db";

/**
 * Monthly credit allocations per plan.
 * These are the credits automatically added on each billing cycle reset.
 */
export const PLAN_MONTHLY_CREDITS: Record<BillingPlan, number> = {
  starter: 500,
  growth: 2000,
  scale: 10000,
};
