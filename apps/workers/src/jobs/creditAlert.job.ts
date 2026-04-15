import { Worker, Job } from 'bullmq';
import { redis } from '../config/redis';
import { CreditAlertJobData } from '@revenos/queue';
import { Workspace, User } from '@revenos/db';
import { EmailService } from '@revenos/communication';

// Initialize email service for workers (using same env vars)
const emailService = new EmailService(
  process.env.RESEND_API_KEY!,
  process.env.FROM_EMAIL!,
  process.env.FROM_NAME!
);

export const creditAlertWorker = new Worker<CreditAlertJobData>(
  'credit-alert',
  async (job: Job<CreditAlertJobData>) => {
    const { workspaceId, currentBalance, monthlyAllocation, thresholdPercent } = job.data;

    console.log(`[CreditAlertJob] Processing alert for workspace ${workspaceId}`);

    // 1. Fetch workspace to get owner
    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) {
      console.warn(`[CreditAlertJob] Workspace ${workspaceId} not found`);
      return;
    }

    // 2. Fetch owner user info
    const owner = await User.findOne({ clerkId: workspace.clerkOwnerId });
    if (!owner) {
      console.warn(`[CreditAlertJob] Owner ${workspace.clerkOwnerId} not found in DB`);
      return;
    }

    // 3. Send email
    await emailService.sendLowCreditAlert(owner.email, {
      balance: currentBalance,
      allocation: monthlyAllocation,
      workspaceName: workspace.name,
      clientUrl: process.env.CLIENT_URL || 'http://localhost:3000',
    });

    console.log(`[CreditAlertJob] Alert sent to ${owner.email} for workspace ${workspace.name}`);
  },
  { connection: redis }
);

creditAlertWorker.on('completed', (job) => {
  console.log(`[CreditAlertWorker] Job ${job.id} completed`);
});

creditAlertWorker.on('failed', (job, err) => {
  console.error(`[CreditAlertWorker] Job ${job?.id} failed:`, err.message);
});
