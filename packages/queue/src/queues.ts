/**
 * @revenos/queue — queues.ts
 *
 * All BullMQ Queue instances for the RevenOs platform.
 *
 * ── Queue inventory ───────────────────────────────────────────────────────────
 *
 *  prospector     — Enriches raw lead lists against the ICP, scores and saves them.
 *  qualifier      — Dual-purpose: sends first outreach email AND classifies replies.
 *  booker         — Phase 1: generates calendar slot proposals and sends them to lead.
 *  booker-confirm — Phase 2: parses lead's slot reply and books the Nylas event.
 *  outreach       — Sends follow-up emails via the email package.
 *  followup       — Delayed scheduler: checks whether a lead needs a follow-up.
 *
 * ── Shared connection ─────────────────────────────────────────────────────────
 * All queues share the SAME Redis connection (this is fine for Queue instances).
 * Workers MUST use `createWorkerConnection()` from ./connection.
 *
 * ── Job options defaults ──────────────────────────────────────────────────────
 * Override per-add call if needed. Defaults here set the safety floor.
 */

import { Queue, JobsOptions } from "bullmq";
import { connection } from "./connection";

// ── Default job options shared across queues ──────────────────────────────────

/** Standard retry policy: 3 attempts with exponential back-off starting at 2 s. */
const STANDARD_JOB_OPTIONS: JobsOptions = {
  attempts: 3,
  backoff: {
    type: "exponential",
    delay: 2_000, // 2 s → 4 s → 8 s
  },
  removeOnComplete: {
    count: 500,  // Keep last 500 completed jobs for Bull Board visibility
    age: 24 * 3600, // Max 24 hours
  },
  removeOnFail: {
    count: 200,  // Keep failed jobs longer for debugging
    age: 7 * 24 * 3600, // 7 days
  },
};

/** Follow-up queue uses longer back-off since delays are intentional. */
const FOLLOWUP_JOB_OPTIONS: JobsOptions = {
  ...STANDARD_JOB_OPTIONS,
  attempts: 3,
  backoff: {
    type: "exponential",
    delay: 5_000, // 5 s → 10 s → 20 s
  },
};

// ── Queue instances ───────────────────────────────────────────────────────────

export const prospectorQueue = new Queue("prospector", {
  connection,
  defaultJobOptions: STANDARD_JOB_OPTIONS,
});

export const qualifierQueue = new Queue("qualifier", {
  connection,
  defaultJobOptions: STANDARD_JOB_OPTIONS,
});

export const bookerQueue = new Queue("booker", {
  connection,
  defaultJobOptions: STANDARD_JOB_OPTIONS,
});

export const bookerConfirmQueue = new Queue("booker-confirm", {
  connection,
  defaultJobOptions: STANDARD_JOB_OPTIONS,
});

export const outreachQueue = new Queue("outreach", {
  connection,
  defaultJobOptions: STANDARD_JOB_OPTIONS,
});

/**
 * Follow-up queue: jobs are typically delayed (hours), so use a longer
 * back-off and keep failed jobs for a full week for diagnosis.
 */
export const followUpQueue = new Queue("followup", {
  connection,
  defaultJobOptions: FOLLOWUP_JOB_OPTIONS,
});

export const feederQueue = new Queue("feeder", {
  connection,
  defaultJobOptions: STANDARD_JOB_OPTIONS,
});

// ── Convenience: all queues as an array ──────────────────────────────────────

export const allQueues = [
  prospectorQueue,
  qualifierQueue,
  bookerQueue,
  bookerConfirmQueue,
  outreachQueue,
  followUpQueue,
  feederQueue,
] as const;

export type QueueName =
  | "prospector"
  | "qualifier"
  | "booker"
  | "booker-confirm"
  | "outreach"
  | "followup"
  | "feeder";

// ── Graceful drain ───────────────────────────────────────────────────────────

/**
 * Closes all queue connections cleanly.
 * Call during SIGTERM / SIGINT in your shutdown handler.
 */
export async function closeAllQueues(): Promise<void> {
  await Promise.all(allQueues.map((q) => q.close()));
  console.info("[Queue] All queues closed.");
}
