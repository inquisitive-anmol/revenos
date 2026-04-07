import { Request, Response } from 'express';
import { getAuth } from '@clerk/express';
import { clerkClient } from '@clerk/express';
import { User, Workspace, WorkspaceMember } from '@revenos/db';
import { ok } from '@/utils/response';
import { BadRequestError } from '@/errors/AppError';
import { provisionWorkspaceForUser } from '@/services/workspace.service';
import logger from '@/config/logger';

/**
 * GET /api/v1/auth/me
 *
 * Returns the MongoDB User document and the active Workspace for the
 * currently authenticated Clerk user.
 *
 * Also handles Just-In-Time provisioning for new users — if no workspace
 * membership exists yet, it provisions one before returning.
 */
export const getMeHandler = async (req: Request, res: Response) => {
  const { userId: clerkUserId } = getAuth(req);
  if (!clerkUserId) throw new BadRequestError('Not authenticated');

  // Check if workspace already exists for this user
  let membership = await WorkspaceMember.findOne({ clerkUserId }).sort({ joinedAt: 1 });

  if (!membership) {
    // New user — provision workspace JIT
    logger.info({ clerkUserId }, 'getMeHandler: no workspace found, provisioning');

    let clerkProfile;
    try {
      clerkProfile = await clerkClient.users.getUser(clerkUserId);
    } catch (err) {
      logger.error({ err, clerkUserId }, 'getMeHandler: failed to fetch Clerk profile');
      throw new BadRequestError('Failed to verify user profile with Clerk.');
    }

    const primaryEmail =
      clerkProfile.emailAddresses.find(
        (e: any) => e.id === clerkProfile.primaryEmailAddressId
      )?.emailAddress ??
      clerkProfile.emailAddresses[0]?.emailAddress ??
      '';

    try {
      await provisionWorkspaceForUser(
        clerkUserId,
        primaryEmail,
        clerkProfile.username || 'New user',
      );
    } catch (err) {
      logger.error({ err, clerkUserId }, 'getMeHandler: failed to provision workspace');
      throw new BadRequestError('Failed to set up your workspace. Please refresh.');
    }

    // Re-fetch membership after provisioning
    membership = await WorkspaceMember.findOne({ clerkUserId }).sort({ joinedAt: 1 });
  }

  const workspaceId = membership?.workspaceId?.toString();

  const [user, workspace] = await Promise.all([
    User.findOne({ clerkId: clerkUserId }).lean(),
    Workspace.findById(workspaceId).lean(),
  ]);

  return ok(res, {
    user: user ?? null,
    workspace: workspace
      ? {
          _id: workspace._id,
          name: workspace.name,
          plan: workspace.plan,
        }
      : null,
    provisioned: true,
  });
};