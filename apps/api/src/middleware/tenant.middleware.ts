import { Request, Response, NextFunction } from 'express';
import { getAuth } from '@clerk/express';
import { BadRequestError } from '@/errors/AppError';

/**
 * Tenant resolution middleware.
 *
 * Resolves the active tenant from (in priority order):
 *   1. X-Tenant-ID header      — explicit header for multi-tenant API calls
 *   2. Clerk orgId claim        — from the authenticated session JWT
 *
 * Attaches req.tenant = { id, slug } for all downstream handlers.
 *
 * TODO: Once @revenos/db is configured, validate the tenant against the DB:
 *   const tenant = await db.tenant.findUnique({ where: { clerkOrgId: tenantId } });
 *   if (!tenant) throw new NotFoundError('Tenant');
 *   if (tenant.status === 'SUSPENDED') throw new ForbiddenError('Tenant suspended');
 *   req.tenant = { id: tenant.id, slug: tenant.slug };
 */
export function tenantGuard(
  req: Request,
  _res: Response,
  next: NextFunction,
): void {
  const tenantIdFromHeader = req.headers['x-tenant-id'] as string | undefined;
  const auth = getAuth(req);
  const tenantIdFromClaims = auth.orgId ?? undefined;

  let tenantId = tenantIdFromHeader ?? tenantIdFromClaims;

  // Development bypass
  if (process.env.NODE_ENV !== 'production' && !tenantId) {
    tenantId = process.env.DEV_WORKSPACE_ID || 'dev-workspace';
  }

  if (!tenantId) {
    throw new BadRequestError(
      'Tenant context required. Provide X-Tenant-ID header or include org context in your session.',
    );
  }

  req.tenant = {
    id: tenantId,
    slug: tenantId, // TODO: replace with DB-sourced slug
  };

  next();
}
