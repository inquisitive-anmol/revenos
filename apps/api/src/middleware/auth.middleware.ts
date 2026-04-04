import { requireAuth, getAuth, clerkMiddleware } from '@clerk/express';
import { Request, Response, NextFunction } from 'express';
import { ForbiddenError, UnauthorizedError } from '@/errors/AppError';

/**
 * Initialises the Clerk context on every request.
 * Must be registered ONCE in app.ts near the top of the middleware stack.
 * After this runs, getAuth(req) is available in all downstream handlers.
 */
export { clerkMiddleware };

/**
 * Route guard — requires a valid Clerk session.
 * Returns 401 if unauthenticated, otherwise attaches req.user and calls next().
 *
 * Usage:
 *   router.get('/me', requireAuthGuard, handler);
 */
export function requireAuthGuard(
  req: Request,
  _res: Response,
  next: NextFunction,
): void {
  const auth = getAuth(req);

  // Development bypass
  if (process.env.NODE_ENV !== 'production' && !auth.userId) {
    req.user = { ...auth, userId: 'dev-user' } as any;
    return next();
  }

  if (!auth.userId) {
    throw new UnauthorizedError('Authentication required');
  }
  req.user = auth as any;
  next();
}

/**
 * Role-based access guard — always use AFTER requireAuthGuard.
 * Reads the `role` claim from the Clerk session JWT.
 *
 * Usage:
 *   router.delete('/tenant', requireAuthGuard, requireRole('admin'), handler);
 */
export function requireRole(...roles: string[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const auth = getAuth(req);
    const sessionRole = (auth.sessionClaims as Record<string, unknown>)
      ?.role as string | undefined;

    if (!sessionRole || !roles.includes(sessionRole)) {
      throw new ForbiddenError(
        `Insufficient permissions. Required: ${roles.join(' | ')}`,
      );
    }
    next();
  };
}

/**
 * Clerk's native requireAuth — use when you want Clerk's default 401 behaviour
 * rather than our custom UnauthorizedError shape.
 */
export { requireAuth };
