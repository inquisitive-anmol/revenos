/**
 * Workers Redis config.
 *
 * Each Worker MUST have its own dedicated Redis connection because BullMQ
 * workers use BLPOP (a blocking command) which monopolises a connection.
 * Sharing a connection between a Queue and a Worker causes deadlocks.
 *
 * This module uses `createWorkerConnection()` from @revenos/queue which applies
 * the same retry strategy, keep-alive, and event listeners as the queue
 * connection — just as a fresh, independent client per worker.
 *
 * Usage (in each job file):
 *   import { redis } from "../config/redis";
 *   export const myWorker = new Worker("queue-name", handler, { connection: redis });
 *
 * Note: if you run multiple workers in the same process, each should call
 * `createWorkerConnection("workerName")` independently to get its own client.
 * The default export here is a shared worker connection — fine for one worker
 * per process but use the factory if you co-locate multiple workers.
 */

import dotenv from "dotenv";
import path from "path";
import { createWorkerConnection } from "@revenos/queue";

// Load .env from monorepo root (works in both dev and production).
dotenv.config({ path: path.join(process.cwd(), "../../.env") });

/**
 * Default shared connection for worker files that import `{ redis }`.
 * Backwards-compatible with existing worker job files.
 */
export const redis = createWorkerConnection("default");

/**
 * Factory — use this when co-locating multiple workers in one process
 * so each gets its own isolated blocking connection.
 *
 * @example
 *   const prospectorConn = createNamedWorkerConnection("prospector");
 *   export const prospectorWorker = new Worker("prospector", handler, { connection: prospectorConn });
 */
export { createWorkerConnection as createNamedWorkerConnection } from "@revenos/queue";