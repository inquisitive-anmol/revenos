import { Request, Response } from 'express';
import { getAuth } from '@clerk/express';
import { User } from '@revenos/db';
import { provisionWorkspaceForUser } from '@/services/workspace.service';
import { ok } from '@/utils/response';
import { BadRequestError, NotFoundError } from '@/errors/AppError';
import logger from '@/config/logger';

/**
 * POST /api/v1/auth/sync
 *
 * Client-side provisioning fallback. Called by the frontend immediately after
 * Clerk confirms the user is signed in. Runs provisionWorkspaceForUser() which
 * is fully idempotent — safe to call multiple times (no duplicates created).
 *
 * This ensures User, Workspace, and WorkspaceMember documents exist in MongoDB
 * even if the Clerk webhook was delayed or missed.
 */
export const syncUserHandler = async (req: Request, res: Response) => {
  const { userId } = getAuth(req);
  if (!userId) throw new BadRequestError('Not authenticated');

  // Extract Clerk profile data passed from the frontend
  const { email, firstName, lastName } = req.body as {
    email?: string;
    firstName?: string;
    lastName?: string;
  };

  if (!email) throw new BadRequestError('email is required in request body');

  logger.info({ userId }, 'auth/sync: provisioning user');

  const workspace = await provisionWorkspaceForUser(
    userId,
    email,
    firstName || 'New',
    lastName || 'User',
  );

  // Fetch the User doc that was upserted during provisioning
  const user = await User.findOne({ clerkId: userId }).lean();

  logger.info({ userId, workspaceId: workspace._id }, 'auth/sync: complete');

  return ok(res, {
    user,
    workspace: {
      _id: workspace._id,
      name: workspace.name,
      plan: workspace.plan,
    },
    provisioned: true,
  });
};

/**
 * GET /api/v1/auth/me
 *
 * Returns the MongoDB User document for the currently authenticated Clerk user.
 * Used by the frontend to populate useUserStore after initial sync.
 */
export const getMeHandler = async (req: Request, res: Response) => {
  const { userId } = getAuth(req);
  if (!userId) throw new BadRequestError('Not authenticated');

  const user = await User.findOne({ clerkId: userId }).lean();
  if (!user) throw new NotFoundError('User profile not found. Try calling /auth/sync first.');

  return ok(res, { user });
};
