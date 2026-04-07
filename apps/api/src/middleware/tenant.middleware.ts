import { Request, Response, NextFunction } from 'express';
import { getAuth } from '@clerk/express';
import { createClerkClient } from '@clerk/backend';
import { WorkspaceMember } from '@revenos/db';
import { BadRequestError, ForbiddenError } from '@/errors/AppError';
import { asyncHandler } from '@/utils/asyncHandler';
import { provisionWorkspaceForUser } from '@/services/workspace.service';
import logger from '@/config/logger';

/**
 * Tenant resolution middleware.
 *
 * Resolves the active workspace (tenant) from:
 *   1. X-Tenant-ID header  — the MongoDB workspaceId the client wants to operate in
 *   2. First WorkspaceMember doc — fallback for single-workspace users
 *
 * Validates the authenticated Clerk user is actually a member of the requested workspace.
 * Attaches req.tenant = { id: workspaceId.toString(), slug } for downstream handlers.
 *
 * Fallback: if no membership found at all (webhook not yet processed), creates a
 * graceful error asking the user to complete onboarding.
 */
export const tenantGuard = asyncHandler(async (
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> => {
  const auth = getAuth(req);
  const clerkUserId = auth.userId;

  if (!clerkUserId) {
    throw new BadRequestError('Authentication required.');
  }

  const workspaceIdFromHeader = req.headers['x-tenant-id'] as string | undefined;
  let workspaceId: string | undefined;

  if (workspaceIdFromHeader) {
    // Validate the user is a member of the explicitly requested workspace
    const membership = await WorkspaceMember.findOne({
      workspaceId: workspaceIdFromHeader,
      clerkUserId,
    });

    if (!membership) {
      throw new ForbiddenError('You are not a member of this workspace.');
    }

    workspaceId = workspaceIdFromHeader;
  } else {
    // No header — pick the first workspace the user belongs to
    const membership = await WorkspaceMember.findOne({ clerkUserId }).sort({ joinedAt: 1 });

    if (membership) {
      workspaceId = membership.workspaceId.toString();
    }
  }

  if (!workspaceId) {
    if (process.env.NODE_ENV !== 'production' && clerkUserId === 'dev-user') {
      workspaceId = process.env.DEV_WORKSPACE_ID || 'dev-workspace';
      logger.warn('tenantGuard: no workspace membership found, using DEV_WORKSPACE_ID');
    } else {
      // Auto-provision workspace and user Just-In-Time
      logger.info({ clerkUserId }, 'tenantGuard: auto-provisioning workspace');
      const clerkClient = createClerkClient({
        secretKey: process.env.CLERK_SECRET_KEY!,
        publishableKey: process.env.CLERK_PUBLISHABLE_KEY!,
      });
      
      const clerkProfile = await clerkClient.users.getUser(clerkUserId);
      const primaryEmail =
        clerkProfile.emailAddresses.find((e: any) => e.id === clerkProfile.primaryEmailAddressId)?.emailAddress ??
        clerkProfile.emailAddresses[0]?.emailAddress ??
        '';

      const workspace = await provisionWorkspaceForUser(
        clerkUserId,
        primaryEmail,
        clerkProfile.firstName || 'New',
        clerkProfile.lastName || 'User'
      );
      workspaceId = workspace._id.toString();
    }
  }

  logger.debug({ clerkUserId, workspaceId }, 'tenantGuard: resolved workspace');

  req.tenant = {
    id: workspaceId as string,
    slug: workspaceId as string,
  };

  next();
});
