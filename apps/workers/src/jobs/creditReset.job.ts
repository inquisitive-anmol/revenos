import { Worker, Job } from 'bullmq';
import { redis } from '../config/redis';
import { CreditResetJobData, creditResetQueue } from '@revenos/queue';
import { Billing } from '@revenos/db';
import { resetMonthlyCredits } from '@revenos/billing';

export const creditResetWorker = new Worker<CreditResetJobData>(
  'credit-reset',
  async (job: Job<CreditResetJobData>) => {
    console.log(`[CreditResetJob] Starting monthly reset scan...`);

    const now = new Date();
    
    // 1. Find all billing records that are due for a reset
    const dueBillings = await Billing.find({
      nextResetAt: { $lte: now },
      status: { $in: ['active', 'trialing'] } // only reset active/trialing ones
    });

    console.log(`[CreditResetJob] Found ${dueBillings.length} workspaces due for reset`);

    // 2. Process resets sequentially (to avoid heavy DB load if many)
    for (const billing of dueBillings) {
      try {
        console.log(`[CreditResetJob] Resetting credits for workspace ${billing.workspaceId}`);
        await resetMonthlyCredits(billing.workspaceId);
      } catch (error: any) {
        console.error(`[CreditResetJob] Failed to reset credits for workspace ${billing.workspaceId}: ${error.message}`);
      }
    }

    console.log(`[CreditResetJob] Scan completed.`);
  },
  { connection: redis }
);

/**
 * Initialize the repeatable job if it doesn't exist
 * Runs every 8 hours as per user preference
 */
export async function setupCreditResetSchedule() {
  const jobs = await creditResetQueue.getRepeatableJobs();
  const hasJob = jobs.some(j => j.name === 'monthly-reset-scan');

  if (!hasJob) {
    await creditResetQueue.add(
      'monthly-reset-scan',
      { scanTimestamp: Date.now() },
      {
        repeat: {
          pattern: '0 */8 * * *', // Every 8 hours
        },
      }
    );
    console.log('[CreditResetJob] Scheduled 8-hour repeatable scan');
  }
}

creditResetWorker.on('completed', (job) => {
  console.log(`[CreditResetWorker] Job ${job.id} completed`);
});

creditResetWorker.on('failed', (job, err) => {
  console.error(`[CreditResetWorker] Job ${job?.id} failed:`, err.message);
});
