import pinoHttp from 'pino-http';
import { randomUUID } from 'crypto';
import logger from '@/config/logger';

/**
 * HTTP request/response logger via pino-http.
 *
 * - Auto-logs method, URL, status, latency, and request ID on every response.
 * - Uses a custom log level: error (5xx), warn (4xx), info (2xx/3xx).
 * - Suppresses health check pings (/health/live) to keep logs clean.
 * - Injects req.id (UUID) for request tracing, honours X-Request-ID header if present.
 */
export const requestLogger = pinoHttp({
  logger,
  genReqId: (req) =>
    (req.headers['x-request-id'] as string | undefined) ?? randomUUID(),
  customLogLevel: (_req, res, err) => {
    if (err || res.statusCode >= 500) return 'error';
    if (res.statusCode >= 400) return 'warn';
    return 'info';
  },
  serializers: {
    req: (req) => ({
      id: req.id,
      method: req.method,
      url: req.url,
      userAgent: req.headers['user-agent'],
      ip: req.remoteAddress,
    }),
    res: (res) => ({
      statusCode: res.statusCode,
    }),
  },
  autoLogging: {
    ignore: (req) =>
      req.url === '/health' ||
      req.url === '/health/live' ||
      req.url === '/health/ready',
  },
});
