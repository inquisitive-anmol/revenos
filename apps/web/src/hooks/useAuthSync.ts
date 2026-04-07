import { useEffect, useRef, useState } from 'react';
import { useUser } from '@clerk/clerk-react';
import { useApi } from '../lib/api';
import { useUserStore, type DbUser } from '../stores/authStore';
import { useWorkspaceStore } from '../stores/workspace.store';

/**
 * useAuthSync
 *
 * Calls POST /api/v1/auth/sync once per session after Clerk confirms the user
 * is signed in. This idempotently provisions the User, Workspace, and
 * WorkspaceMember documents in MongoDB — acting as a reliable client-side
 * fallback in case the Clerk webhook was delayed or missed.
 *
 * Also populates useUserStore.dbUser and useWorkspaceStore with fresh data.
 *
 * Should be called once in ProtectedRoute (or a top-level authenticated layout).
 */
export const useAuthSync = () => {
  const { isSignedIn, isLoaded, user: clerkUser } = useUser();
  const api = useApi();
  const { setDbUser } = useUserStore();
  const { setWorkspaces } = useWorkspaceStore();

  const [isSyncing, setIsSyncing] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [isSynced, setIsSynced] = useState(false);

  // Prevent double-firing in StrictMode / rerenders
  const hasSynced = useRef(false);

  useEffect(() => {
    if (!isLoaded || !isSignedIn || !clerkUser) return;
    if (hasSynced.current) return;

    hasSynced.current = true;

    const sync = async () => {
      setIsSyncing(true);
      setSyncError(null);

      try {


        // 1. Auto-provision (if needed) via middleware + get back user & active workspace
        const syncRes = await api.get('/api/v1/auth/me');

        const dbUser = syncRes.data?.data?.user as DbUser | null;
        if (dbUser) setDbUser(dbUser);

        // 2. Fetch all workspaces for the switcher
        const wsRes = await api.get('/api/v1/workspaces/mine');
        const workspaces = wsRes.data?.data?.workspaces ?? [];
        setWorkspaces(workspaces);

        setIsSynced(true);
      } catch (err: any) {
        hasSynced.current = false; // allow retry on next mount
        setSyncError(
          err?.response?.data?.error?.message ?? 'Failed to sync your account. Please refresh.',
        );
      } finally {
        setIsSyncing(false);
      }
    };

    sync();
  }, [isLoaded, isSignedIn, clerkUser]);

  return { isSyncing, isSynced, syncError };
};
