import Redis from 'ioredis';
import { env } from './env';
import logger from './logger';

/**
 * Unified Redis client — works with both local Redis and Upstash.
 *
 * Dev:  REDIS_URL=redis://localhost:6379
 * Prod: REDIS_URL=rediss://default:TOKEN@HOST:PORT  (Upstash TLS)
 *
 * The URL scheme drives the connection config automatically.
 */
const redis = new Redis(env.REDIS_URL, {
  maxRetriesPerRequest: null,
  retryStrategy: (times) => {
    if (times > 5) {
      logger.error('Redis: max retries exceeded — aborting reconnect');
      return null; // stop retrying
    }
    const delay = Math.min(times * 100, 3_000);
    logger.warn({ attempt: times, delayMs: delay }, 'Redis: retrying connection');
    return delay;
  },
  lazyConnect: true,
  enableReadyCheck: true,
  connectTimeout: 10_000,
});

redis.on('connect', () => logger.info('Redis: connected'));
redis.on('ready', () => logger.info('Redis: ready'));
redis.on('error', (err) => logger.error({ err }, 'Redis: connection error'));
redis.on('close', () => logger.warn('Redis: connection closed'));
redis.on('reconnecting', () => logger.info('Redis: reconnecting...'));

export default redis;
