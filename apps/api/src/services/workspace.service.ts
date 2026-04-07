import crypto from 'crypto';
import { Workspace, WorkspaceMember, User, IWorkspace } from '@revenos/db';
import { NotFoundError, ForbiddenError } from '@/errors/AppError';
import logger from '@/config/logger';

// ── Helpers ───────────────────────────────────────────────────────────────────

const generateInviteToken = () => crypto.randomUUID();

// ── Workspace creation (called by Clerk webhook) ──────────────────────────────

export const provisionWorkspaceForUser = async (
  clerkUserId: string,
  email: string,
  username: string,
): Promise<IWorkspace> => {
  // Idempotent: if a workspace already exists for this Clerk user, return it
  const existing = await Workspace.findOne({ clerkOwnerId: clerkUserId });
  if (existing) {
    logger.info({ clerkUserId }, 'Workspace already exists, skipping creation');
    return existing;
  }

  const name = `${username}'s Workspace`;

  const workspace = await Workspace.create({
    clerkOwnerId: clerkUserId,
    name,
    inviteToken: generateInviteToken(),
  });

  // Upsert User identity doc
  await User.findOneAndUpdate(
    { clerkId: clerkUserId },
    { clerkId: clerkUserId, email, name: username },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  );

  // Create owner membership
  await WorkspaceMember.create({
    workspaceId: workspace._id,
    clerkUserId,
    role: 'owner',
  });

  logger.info({ clerkUserId, workspaceId: workspace._id }, 'Workspace provisioned');
  return workspace;
};

// ── List workspaces for a user ────────────────────────────────────────────────

export const listWorkspacesForUser = async (clerkUserId: string) => {
  const memberships = await WorkspaceMember.find({ clerkUserId })
    .populate<{ workspaceId: IWorkspace }>('workspaceId')
    .sort({ joinedAt: 1 })
    .lean();

  return memberships.map((m) => ({
    workspace: m.workspaceId,
    role: m.role,
    joinedAt: m.joinedAt,
  }));
};

// ── Get single workspace (tenant-scoped) ─────────────────────────────────────

export const getWorkspace = async (workspaceId: string): Promise<IWorkspace | null> => {
  return Workspace.findById(workspaceId);
};

// ── Invite link: look up workspace by token ────────────────────────────────────

export const getWorkspaceByInviteToken = async (token: string): Promise<IWorkspace | null> => {
  return Workspace.findOne({ inviteToken: token });
};

// ── Invite link: accept invite ────────────────────────────────────────────────

export const acceptWorkspaceInvite = async (
  token: string,
  clerkUserId: string,
): Promise<{ workspaceId: string; role: string }> => {
  const workspace = await Workspace.findOne({ inviteToken: token });
  if (!workspace) {
    throw new NotFoundError('Invite link is invalid or has been revoked.');
  }

  // Upsert membership (idempotent — safe to call multiple times)
  const membership = await WorkspaceMember.findOneAndUpdate(
    { workspaceId: workspace._id, clerkUserId },
    { $setOnInsert: { workspaceId: workspace._id, clerkUserId, role: 'member' } },
    { upsert: true, new: true },
  );

  logger.info({ clerkUserId, workspaceId: workspace._id }, 'User joined workspace via invite');

  return {
    workspaceId: workspace._id.toString(),
    role: membership.role,
  };
};

// ── Regenerate invite token (owner only) ──────────────────────────────────────

export const regenerateInviteToken = async (
  workspaceId: string,
  clerkUserId: string,
): Promise<string> => {
  const membership = await WorkspaceMember.findOne({ workspaceId, clerkUserId });
  if (!membership || membership.role !== 'owner') {
    throw new ForbiddenError('Only workspace owners can regenerate the invite link.');
  }

  const newToken = generateInviteToken();
  await Workspace.findByIdAndUpdate(workspaceId, { inviteToken: newToken });

  logger.info({ clerkUserId, workspaceId }, 'Invite token regenerated');
  return newToken;
};