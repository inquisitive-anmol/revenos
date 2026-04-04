import pino from 'pino';
import { env } from './env';

/**
 * Singleton Pino logger.
 *
 * - Development: pretty-printed with colors (pino-pretty)
 * - Production:  raw JSON for log aggregators (Datadog, Logtail, etc.)
 *
 * Always import this instead of using console.log.
 */
const logger = pino({
  level: env.LOG_LEVEL,
  ...(env.NODE_ENV !== 'production'
    ? {
        transport: {
          target: 'pino-pretty',
          options: {
            colorize: true,
            translateTime: 'SYS:HH:MM:ss',
            ignore: 'pid,hostname',
          },
        },
      }
    : {
        formatters: {
          level: (label) => ({ level: label }),
        },
        timestamp: pino.stdTimeFunctions.isoTime,
      }),
  base: {
    service: 'revenos-api',
    env: env.NODE_ENV,
  },
});

export default logger;
