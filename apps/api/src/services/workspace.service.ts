import { Workspace, User, IWorkspace } from "@revenos/db";

export const createWorkspace = async (
  name: string,
  clerkId: string,
  email: string,
  userName: string
): Promise<IWorkspace> => {
  const workspace = await Workspace.create({ name });

  await User.create({
    clerkId,
    workspaceId: workspace._id,
    role: "owner",
    email,
    name: userName,
    onboardingComplete: false,
  });

  return workspace;
};

export const getWorkspace = async (
  workspaceId: string
): Promise<IWorkspace | null> => {
  return Workspace.findById(workspaceId);
};