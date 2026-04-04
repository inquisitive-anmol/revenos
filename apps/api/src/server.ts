import { createServer } from 'http';
import gracefulShutdown from 'http-graceful-shutdown';
import { createApp } from './app';
import { attachSocketIO } from './socket/index';
import { env, logger, redis } from './config/index';

/**
 * Server bootstrap.
 *
 * Order:
 *   1. Create Express app
 *   2. Wrap in native HTTP server (required for Socket.IO)
 *   3. Attach Socket.IO
 *   4. Connect Redis (eager check before accepting traffic)
 *   5. Start listening
 *   6. Register graceful shutdown (SIGINT / SIGTERM)
 */
async function bootstrap(): Promise<void> {
  // ── 1. App ─────────────────────────────────────────────────────────────
  const app = createApp();

  // ── 2. HTTP server ─────────────────────────────────────────────────────
  const server = createServer(app);

  // ── 3. Socket.IO ───────────────────────────────────────────────────────
  attachSocketIO(server);

  // ── 4. Redis connection check ──────────────────────────────────────────
  try {
    await redis.ping();
    logger.info('Redis: connection verified');
  } catch (err) {
    logger.fatal({ err }, 'Redis: failed to connect on startup');
    process.exit(1);
  }

  // ── 4.5. MongoDB connection ──────────────────────────────────────────────
  try {
    const mongoose = require('mongoose');
    await mongoose.connect(env.DATABASE_URL);
    logger.info('MongoDB: connection established');
  } catch (err) {
    logger.fatal({ err }, 'MongoDB: failed to connect on startup');
    process.exit(1);
  }

  // ── 5. Start server ────────────────────────────────────────────────────
  server.listen(env.PORT, () => {
    logger.info(
      { port: env.PORT, env: env.NODE_ENV },
      `🚀 API server running on port ${env.PORT}`,
    );
  });

  // ── 6. Graceful shutdown ───────────────────────────────────────────────
  gracefulShutdown(server, {
    signals: 'SIGINT SIGTERM',
    timeout: 10_000, // 10s to drain connections
    development: env.NODE_ENV !== 'production',
    onShutdown: async () => {
      logger.info('Graceful shutdown: closing Redis connection...');
      await redis.quit();
      // TODO: await db.$disconnect();  (once @revenos/db is set up)
    },
    finally: () => {
      logger.info('Server shut down cleanly. Goodbye 👋');
    },
  });
}

bootstrap().catch((err) => {
  // eslint-disable-next-line no-console
  console.error('Fatal: failed to start server', err);
  process.exit(1);
});
