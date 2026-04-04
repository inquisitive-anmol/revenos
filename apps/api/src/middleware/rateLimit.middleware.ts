import { rateLimit, Options } from 'express-rate-limit';
import { RedisStore } from 'rate-limit-redis';
import redis from '@/config/redis';
import { env } from '@/config/env';

/**
 * Creates a Redis-backed rate limiter.
 * All limiters use the same ioredis client (local / Upstash via REDIS_URL).
 */
function createLimiter(options: Partial<Options>) {
  return rateLimit({
    windowMs: env.RATE_LIMIT_WINDOW_MS,
    max: env.RATE_LIMIT_MAX,
    standardHeaders: 'draft-7', // RateLimit-* headers (RFC 6585)
    legacyHeaders: false,
    store: new RedisStore({
      // ioredis adapter for rate-limit-redis v4
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      sendCommand: (...args: string[]) => redis.call(args[0]!, ...args.slice(1)) as any,
    }),
    message: {
      success: false,
      error: {
        code: 'TOO_MANY_REQUESTS',
        message: 'Too many requests. Please try again later.',
      },
    },
    ...options,
  });
}

/**
 * General API limiter — applied to all /api/v1 routes.
 * Default: 100 requests per minute per IP.
 */
export const generalRateLimiter = createLimiter({});

/**
 * Auth-specific limiter — stricter, for login/register endpoints.
 * Default: 10 requests per minute per IP.
 */
export const authRateLimiter = createLimiter({
  windowMs: 60_000,
  max: env.AUTH_RATE_LIMIT_MAX,
  message: {
    success: false,
    error: {
      code: 'TOO_MANY_REQUESTS',
      message: 'Too many authentication attempts. Please wait 1 minute.',
    },
  },
});

/**
 * Webhook limiter — permissive, for external service callbacks (Clerk, Stripe, etc.).
 */
export const webhookRateLimiter = createLimiter({
  windowMs: 60_000,
  max: 500,
});
