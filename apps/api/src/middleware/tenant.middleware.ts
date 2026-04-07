import { Request, Response, NextFunction } from 'express';
import { getAuth } from '@clerk/express';
import { WorkspaceMember } from '@revenos/db';
import { BadRequestError, ForbiddenError } from '@/errors/AppError';
import { asyncHandler } from '@/utils/asyncHandler';
import logger from '@/config/logger';

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
    const membership = await WorkspaceMember.findOne({
      workspaceId: workspaceIdFromHeader,
      clerkUserId,
    });

    if (!membership) {
      throw new ForbiddenError('You are not a member of this workspace.');
    }

    workspaceId = workspaceIdFromHeader;
  } else {
    const membership = await WorkspaceMember.findOne({ clerkUserId }).sort({ joinedAt: 1 });

    if (membership) {
      workspaceId = membership.workspaceId.toString();
    }
  }

  if (!workspaceId) {
    throw new ForbiddenError('No workspace found. Please refresh or contact support.');
  }

  logger.debug({ clerkUserId, workspaceId }, 'tenantGuard: resolved workspace');

  req.tenant = {
    id: workspaceId,
    slug: workspaceId,
  };

  next();
});