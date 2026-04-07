import { Request, Response } from 'express';
import { getAuth } from '@clerk/express';
import { User, Workspace } from '@revenos/db';
import { ok } from '@/utils/response';
import { BadRequestError, NotFoundError } from '@/errors/AppError';
/**
 * GET /api/v1/auth/me
 *
 * Returns the MongoDB User document and the active Workspace for the currently authenticated Clerk user.
 * Protected by tenantGuard which guarantees the user has a workspace.
 */
export const getMeHandler = async (req: Request, res: Response) => {
  const { userId } = getAuth(req);
  if (!userId) throw new BadRequestError('Not authenticated');

  const user = await User.findOne({ clerkId: userId }).lean();
  if (!user) throw new NotFoundError('User profile not found. Try logging out and back in.');

  const workspace = await Workspace.findById(req.tenant?.id).lean();

  return ok(res, {
    user,
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
