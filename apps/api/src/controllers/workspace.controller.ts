import { Request, Response } from 'express';
import { getAuth } from '@clerk/express';
import {
  getWorkspace,
  listWorkspacesForUser,
  getWorkspaceByInviteToken,
  acceptWorkspaceInvite,
  regenerateInviteToken,
} from '@/services/workspace.service';
import { ok, created } from '@/utils/response';
import { NotFoundError, BadRequestError } from '@/errors/AppError';
import logger from '@/config/logger';

// GET /api/v1/workspaces/mine
export const listWorkspacesHandler = async (req: Request, res: Response) => {
  const { userId } = getAuth(req);
  if (!userId) throw new BadRequestError('Not authenticated');

  logger.info({ userId }, 'Listing workspaces for user');
  const workspaces = await listWorkspacesForUser(userId);
  return ok(res, { workspaces });
};

// GET /api/v1/workspaces/me  (current active workspace — tenant-scoped)
export const getWorkspaceHandler = async (req: Request, res: Response) => {
  const workspaceId = req.tenant?.id;
  if (!workspaceId) throw new NotFoundError('Workspace ID missing');

  const workspace = await getWorkspace(workspaceId);
  if (!workspace) throw new NotFoundError('Workspace');

  return ok(res, { workspace });
};

// GET /api/v1/workspaces/invite/:token  (public — shows workspace info before accepting)
export const getInviteInfoHandler = async (req: Request, res: Response) => {
  const { token } = req.params as { token: string };
  const workspace = await getWorkspaceByInviteToken(token);
  if (!workspace) throw new NotFoundError('Invite link is invalid or has been revoked.');

  // Only expose safe fields to unauthenticated viewers
  return ok(res, {
    workspace: {
      name: workspace.name,
      plan: workspace.plan,
    },
  });
};

// POST /api/v1/workspaces/invite/:token/accept  (authenticated)
export const acceptInviteHandler = async (req: Request, res: Response) => {
  const { token } = req.params as { token: string };
  const { userId } = getAuth(req);
  if (!userId) throw new BadRequestError('Not authenticated');

  const result = await acceptWorkspaceInvite(token, userId);
  return created(res, result);
};

// POST /api/v1/workspaces/:id/invite/regenerate  (owner only)
export const regenerateInviteHandler = async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  const { userId } = getAuth(req);
  if (!userId) throw new BadRequestError('Not authenticated');

  const newToken = await regenerateInviteToken(id, userId);
  return ok(res, { inviteToken: newToken });
};
