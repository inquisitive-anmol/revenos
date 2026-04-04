import { Request, Response } from 'express';
import { createWorkspace, getWorkspace } from '@/services/workspace.service';
import { created, ok } from '@/utils/response';
import { NotFoundError } from '@/errors/AppError';
import logger from '@/config/logger';

export const createWorkspaceHandler = async (req: Request, res: Response) => {
  const { name, email, userName } = req.body;
  const clerkId = (req as any).auth?.userId;

  logger.info({ clerkId, name }, 'Creating new workspace');

  const workspace = await createWorkspace(name, clerkId, email, userName);
  
  logger.info({ workspaceId: workspace._id }, 'Workspace created successfully');
  return created(res, { workspace });
};

export const getWorkspaceHandler = async (req: Request, res: Response) => {
  // For getWorkspace, usually the tenant.id is the workspaceId
  const workspaceId = req.tenant?.id;
  if (!workspaceId) {
    throw new NotFoundError('Tenant / Workspace ID missing');
  }
  const workspace = await getWorkspace(workspaceId);
  if (!workspace) {
    throw new NotFoundError('Workspace');
  }

  return ok(res, { workspace });
};
