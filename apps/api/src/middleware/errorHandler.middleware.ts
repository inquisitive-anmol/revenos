import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { AppError, ValidationError, InternalError } from '@/errors/AppError';
import logger from '@/config/logger';

/**
 * Centralized error handler — MUST be the last middleware registered in app.ts.
 *
 * Normalizes all error types into a consistent API response shape:
 *   { success: false, error: { code, message, details?, requestId } }
 *
 * ── AppError (isOperational: true)  → warn log  + typed HTTP response
 * ── ZodError                        → 422       + field-level details
 * ── AppError (isOperational: false) → fatal log + generic 500
 * ── Unknown error                   → fatal log + generic 500
 *
 * TODO: For non-operational errors, dispatch to crash notifier (Discord webhook, Sentry, etc.):
 *   await notifyCrash({ error: appError, requestId }).catch(() => {});
 */
export function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
  _next: NextFunction,
): void {
  // pino-http injects req.id
  const requestId = (req as any).id as string | undefined;

  // ── 1. Normalise to AppError ─────────────────────────────────────────────
  let appError: AppError;

  if (err instanceof AppError) {
    appError = err;
  } else if (err instanceof ZodError) {
    const details = err.issues.map((i) => ({
      field: i.path.join('.'),
      message: i.message,
      code: i.code,
    }));
    appError = new ValidationError('Validation failed', details);
  } else if (err instanceof SyntaxError && 'body' in err) {
    appError = new AppError('Invalid JSON in request body', 400, 'INVALID_JSON');
  } else if (err instanceof Error) {
    appError = new InternalError(
      'An unexpected error occurred',
      // Expose underlying message only outside production
      process.env.NODE_ENV !== 'production' ? err.message : undefined,
    );
    appError.stack = err.stack;
  } else {
    appError = new InternalError('An unknown error occurred');
  }

  // ── 2. Log ───────────────────────────────────────────────────────────────
  const logCtx = {
    requestId,
    errorCode: appError.errorCode,
    statusCode: appError.statusCode,
    details: appError.details,
    stack: appError.stack,
  };

  if (!appError.isOperational) {
    logger.fatal({ err: appError, ...logCtx }, 'Non-operational error');
    // TODO: notifyCrash({ appError, requestId, req }).catch(() => {});
  } else {
    logger.warn({ err: appError, ...logCtx }, appError.message);
  }

  // ── 3. Respond ───────────────────────────────────────────────────────────
  if (res.headersSent) return;

  res.status(appError.statusCode).json({
    success: false,
    error: {
      code: appError.errorCode,
      message: appError.message,
      ...(appError.details !== undefined && { details: appError.details }),
      ...(requestId && { requestId }),
    },
  });
}

/**
 * 404 catch-all — registered after all routes, before errorHandler.
 */
export function notFoundHandler(req: Request, res: Response): void {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: `Route ${req.method} ${req.path} not found`,
    },
  });
}
