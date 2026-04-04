import { Request, Response } from 'express';
import { ok } from '@/utils/response';
import redis from '@/config/redis';
import logger from '@/config/logger';

const startTime = Date.now();

/**
 * GET /health
 * Public liveness check. Always returns 200 if the Node process is running.
 */
export async function healthCheck(_req: Request, res: Response): Promise<void> {
  ok(res, {
    status: 'ok',
    uptime: Math.floor((Date.now() - startTime) / 1000),
    timestamp: new Date().toISOString(),
  });
}

/**
 * GET /health/live
 * Kubernetes liveness probe — minimal response, just proves the process is alive.
 */
export function livenessCheck(_req: Request, res: Response): void {
  res.status(200).json({ status: 'alive' });
}

/**
 * GET /health/ready
 * Kubernetes readiness probe — verifies external dependencies are reachable.
 * Returns 503 if any critical dependency is down.
 */
export async function readinessCheck(
  _req: Request,
  res: Response,
): Promise<void> {
  const checks: Record<string, 'ok' | 'error'> = {};
  let allHealthy = true;

  // ── Redis ────────────────────────────────────────────────────────────────
  try {
    await redis.ping();
    checks['redis'] = 'ok';
  } catch (err) {
    logger.warn({ err }, 'Health: Redis ping failed');
    checks['redis'] = 'error';
    allHealthy = false;
  }

  // ── Database ─────────────────────────────────────────────────────────────
  // TODO: Add DB check once @revenos/db is configured:
  // try { await db.$queryRaw`SELECT 1`; checks.db = 'ok'; }
  // catch { checks.db = 'error'; allHealthy = false; }

  if (!allHealthy) {
    res.status(503).json({
      success: false,
      status: 'degraded',
      checks,
      timestamp: new Date().toISOString(),
    });
    return;
  }

  ok(res, {
    status: 'ready',
    checks,
    uptime: Math.floor((Date.now() - startTime) / 1000),
    timestamp: new Date().toISOString(),
  });
}
