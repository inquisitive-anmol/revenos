import * as Sentry from '@sentry/node';
import { nodeProfilingIntegration } from '@sentry/profiling-node';
import { env } from './config/env';

Sentry.init({
  // Use pseudo-dsn if none provided during dev, or actual from env
  dsn: env.SENTRY_DSN || "https://dummy@o0.ingest.sentry.io/0",
  integrations: [
    nodeProfilingIntegration(),
  ],
  // Performance Monitoring
  tracesSampleRate: 1.0, //  Capture 100% of the transactions

  // Set sampling rate for profiling - this is relative to tracesSampleRate
  profilesSampleRate: 1.0,
});
