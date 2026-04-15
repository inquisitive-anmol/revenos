/**
 * @revenos/queue — connection.ts
 *
 * Singleton ioredis connection shared across all BullMQ Queue and Worker
 * instances in the monorepo.
 *
 * Rules for BullMQ connections:
 *  - Queue instances share one connection (this one).
 *  - Worker instances need a SEPARATE connection because BullMQ workers use
 *    Redis blocking commands (BLPOP). Export `createWorkerConnection()` for that.
 *  - Never reuse a Queue connection for a Worker; it will deadlock.
 *
 * Usage:
 *   import { connection, createWorkerConnection } from "@revenos/queue";
 */

import { Redis, RedisOptions } from "ioredis";

// ── Shared base Redis options ─────────────────────────────────────────────────

const BASE_OPTIONS: RedisOptions = {
  // BullMQ requirement: must be null (disables per-command timeout so blocking
  // commands like BLPOP never time out prematurely).
  maxRetriesPerRequest: null,

  // Exponential back-off: 100ms → 200ms → … capped at 5 s. After 10 failed
  // attempts the process logs a fatal and gives up — prevents spinning forever.
  retryStrategy(times: number): number | null {
    if (times > 10) {
      console.error(
        `[Queue/Redis] Max reconnect attempts (${times}) exceeded — giving up.`
      );
      return null; // stop retrying; ioredis will emit 'error'
    }
    const delay = Math.min(times * 100, 5_000);
    console.warn(`[Queue/Redis] Reconnecting (attempt ${times}), delay: ${delay}ms`);
    return delay;
  },

  // Don't block startup — connect lazily on first command.
  lazyConnect: true,

  // Verify the connection is fully ready (AUTH + SELECT) before accepting cmds.
  enableReadyCheck: true,

  // Connection-level timeout.
  connectTimeout: 10_000,

  // Keep-alive so NAT/firewall doesn't drop idle connections.
  keepAlive: 10_000,
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function attachEventListeners(client: Redis, label: string): void {
  client.on("connect",     () => console.info(`[Queue/Redis:${label}] connecting…`));
  client.on("ready",       () => console.info(`[Queue/Redis:${label}] ready`));
  client.on("reconnecting",() => console.warn(`[Queue/Redis:${label}] reconnecting…`));
  client.on("close",       () => console.warn(`[Queue/Redis:${label}] connection closed`));
  client.on("error", (err: Error) =>
    console.error(`[Queue/Redis:${label}] error`, err.message)
  );
}

function buildRedisUrl(): string {
  const url = process.env.REDIS_URL;
  if (!url) {
    throw new Error(
      "[Queue/Redis] REDIS_URL is not set. " +
      "Add it to your .env file (e.g. redis://localhost:6379 for dev, " +
      "rediss://default:TOKEN@HOST:PORT for Upstash prod)."
    );
  }
  return url;
}

export const connection = new Redis(buildRedisUrl(), BASE_OPTIONS);
attachEventListeners(connection, "queue");
// BullMQ attaches multiple listeners per Queue to the shared connection
connection.setMaxListeners(100);

// ── Factory for Worker connections ───────────────────────────────────────────

/**
 * Creates and returns a FRESH Redis connection for a BullMQ Worker.
 *
 * Workers use BLPOP (blocking reads) and MUST NOT share their connection with
 * Queue instances. Call this once per Worker, not per job.
 *
 * @param workerName - Used in log labels for easy debugging.
 */
export function createWorkerConnection(workerName: string): Redis {
  const client = new Redis(buildRedisUrl(), BASE_OPTIONS);
  attachEventListeners(client, `worker:${workerName}`);
  return client;
}

// ── Graceful shutdown ─────────────────────────────────────────────────────────

/**
 * Closes the singleton queue connection cleanly.
 * Call this in your shutdown handler (SIGTERM / SIGINT).
 */
export async function closeQueueConnection(): Promise<void> {
  await connection.quit();
  console.info("[Queue/Redis] queue connection closed");
}
