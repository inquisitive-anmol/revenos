// ── MUST be imported before anything that uses Express ──────────────────────
import './sentry'; // Sentry instrumentation must be imported first
import 'express-async-errors';

import express, { Express } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import { clerkMiddleware } from '@/middleware/auth.middleware';
import { requestLogger } from '@/middleware/requestLogger.middleware';
import { generalRateLimiter } from '@/middleware/rateLimit.middleware';
import {
  errorHandler,
  notFoundHandler,
} from '@/middleware/errorHandler.middleware';
import {
  healthCheck,
  livenessCheck,
  readinessCheck,
} from '@/controllers/health.controller';
import router from '@/routes/index';
import { env } from '@/config/env';
import { parseCSV } from '@/utils/index';
import * as Sentry from '@sentry/node';
import { allQueues } from '@revenos/queue';
import { ExpressAdapter } from '@bull-board/express';
import { createBullBoard } from '@bull-board/api';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { getAuth } from '@clerk/express';

/**
 * Express application factory.
 *
 * Returns a fully configured Express app without binding to a port.
 * Keeping this separate from server.ts allows testing without a real HTTP server.
 *
 * Middleware order (matters):
 *   1. Security (helmet, cors, trust-proxy)
 *   2. Body parsing + compression
 *   3. Request logging (pino-http)
 *   4. Clerk context initialisation
 *   5. General rate limiter
 *   6. Health endpoints (no auth, no rate limit)
 *   7. API routes (/api/v1)
 *   8. 404 catch-all
 *   9. Centralized error handler  ← MUST be last
 */
export function createApp(): Express {
  const app = express();

  // ── Bull Board Setup ──────────────────────────────────────────────────
  const serverAdapter = new ExpressAdapter();
  serverAdapter.setBasePath('/admin/queues');

  createBullBoard({
    queues: allQueues.map((q) => new BullMQAdapter(q)),
    serverAdapter,
  });

  // ── 1. Security ────────────────────────────────────────────────────────
  app.use(helmet());
  app.use(
    cors({
      origin: parseCSV(env.CORS_ORIGINS),
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Tenant-ID', 'X-Request-ID'],
    }),
  );
  app.set('trust proxy', 1); // Safe behind nginx / cloud load balancers

  // ── 2. Body parsing + compression ─────────────────────────────────────
  // The `verify` callback captures the raw Buffer before JSON parsing.
  // Required for Svix webhook signature verification on /webhooks/clerk.
  app.use((req, res, next) => {
    const isCampaignUpload = req.path === '/api/v1/campaigns' || req.path.match(/^\/api\/v1\/campaigns\/[^\/]+\/prospect$/);
    const limit = isCampaignUpload ? '10mb' : '100kb';
    express.json({
      limit,
      verify: (req: any, _res, buf) => {
        req.rawBody = buf;
      },
    })(req, res, next);
  });
  app.use(express.urlencoded({ extended: true, limit: '100kb' }));
  app.use(compression());

  // ── 3. Request logging ────────────────────────────────────────────────
  app.use(requestLogger);

  // ── 4. Clerk context (non-blocking — does NOT enforce auth) ───────────
  app.use(clerkMiddleware());

  // ── Bull Board Route (Protected) ──────────────────────────────────────
  app.use(
    '/admin/queues',
    (req, res, next) => {
      // Basic security check: user must be authenticated in Clerk
      const auth = getAuth(req);
      // Check if user is authenticated at all
      if (!auth.userId) {
        return process.env.NODE_ENV === 'production' 
          ? res.status(401).send('Unauthorized')
          : next(); // allow local dev bypass if no session
      }

      // Check for Admin role in Clerk session claims
      // (This assumes you've added role to publicMetadata or metadata in Clerk dashboard)
      const claim = auth.sessionClaims as any;
      const role = claim?.metadata?.role || claim?.publicMetadata?.role;
      
      if (role !== 'admin' && process.env.NODE_ENV === 'production') {
        return res.status(403).send('Forbidden: Admin access required');
      }
      next();
    },
    serverAdapter.getRouter()
  );

  // ── 5. General rate limiter ───────────────────────────────────────────
  app.use('/api', generalRateLimiter);

  // ── 6. Health endpoints (public, no rate limit) ───────────────────────
  app.get('/health', healthCheck);
  app.get('/health/live', livenessCheck);
  app.get('/health/ready', readinessCheck);

  // ── 7. API routes ─────────────────────────────────────────────────────
  app.use('/api/v1', router);

  // ── 8. 404 catch-all (after all routes) ───────────────────────────────
  app.use(notFoundHandler);

  // ── 9. Centralized error handler (MUST be last) ────────────────────────
  Sentry.setupExpressErrorHandler(app);
  app.use(errorHandler);

  return app;
}
