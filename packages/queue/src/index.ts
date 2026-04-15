/**
 * @revenos/queue — index.ts
 *
 * Public API for the @revenos/queue package.
 *
 * Everything consumers need is re-exported from here.
 * Do NOT import from sub-modules directly — always use:
 *   import { prospectorQueue, createWorkerConnection } from "@revenos/queue";
 */

// ── Connection utilities ──────────────────────────────────────────────────────
export {
  connection,
  createWorkerConnection,
  closeQueueConnection,
} from "./connection.js";

// ── Queue instances ───────────────────────────────────────────────────────────
export {
  prospectorQueue,
  qualifierQueue,
  bookerQueue,
  bookerConfirmQueue,
  outreachQueue,
  followUpQueue,
  feederQueue,
  allQueues,
  closeAllQueues,
  type QueueName,
} from "./queues.js";

// ── TypeScript types ──────────────────────────────────────────────────────────
export type {
  ProspectorJobData,
  QualifierOutreachJobData,
  QualifierReplyJobData,
  OutreachJobData,
  FollowUpJobData,
  BookerJobData,
  BookerConfirmJobData,
  BookerConfirmJobResult,
} from "./types.js";
