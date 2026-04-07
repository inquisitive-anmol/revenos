import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface WorkspaceInfo {
  _id: string;
  name: string;
  plan: string;
  inviteToken: string;
}

interface WorkspaceMembership {
  workspace: WorkspaceInfo;
  role: 'owner' | 'admin' | 'member';
  joinedAt: string;
}

interface WorkspaceState {
  workspaces: WorkspaceMembership[];
  activeWorkspaceId: string | null;

  setWorkspaces: (workspaces: WorkspaceMembership[]) => void;
  setActiveWorkspace: (id: string) => void;
  clearWorkspaces: () => void;

  /** Derived: the full active workspace object */
  getActiveWorkspace: () => WorkspaceMembership | undefined;
}

export const useWorkspaceStore = create<WorkspaceState>()(
  persist(
    (set, get) => ({
      workspaces: [],
      activeWorkspaceId: null,

      setWorkspaces: (workspaces) => {
        const current = get().activeWorkspaceId;
        // If the currently active workspace is still in the list, keep it.
        // Otherwise, default to the first one.
        const stillValid = workspaces.some((m) => m.workspace._id === current);
        set({
          workspaces,
          activeWorkspaceId: stillValid ? current : workspaces[0]?.workspace._id ?? null,
        });
      },

      setActiveWorkspace: (id) => set({ activeWorkspaceId: id }),

      clearWorkspaces: () => set({ workspaces: [], activeWorkspaceId: null }),

      getActiveWorkspace: () => {
        const { workspaces, activeWorkspaceId } = get();
        return workspaces.find((m) => m.workspace._id === activeWorkspaceId);
      },
    }),
    {
      name: 'revenos-workspace', // localStorage key
      partialize: (state) => ({
        activeWorkspaceId: state.activeWorkspaceId,
      }),
    }
  )
);
