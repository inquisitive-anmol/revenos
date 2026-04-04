import type { AuthObject } from '@clerk/express';

export interface Tenant {
  id: string;
  slug: string;
}

declare global {
  namespace Express {
    interface Request {
      /**
       * Clerk auth object — populated by clerkMiddleware() on every request.
       * Access the full object via getAuth(req) from @clerk/express.
       */
      user?: AuthObject;

      /**
       * Resolved tenant — populated by tenantGuard middleware.
       * Contains the active tenant's id and slug.
       */
      tenant?: Tenant;
    }
  }
}
