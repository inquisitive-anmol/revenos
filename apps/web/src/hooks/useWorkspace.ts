import { useEffect, useState } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { useWorkspaceStore } from '../stores/workspace.store';
import { useApi } from '../lib/api';

/**
 * Loads all workspaces the authenticated user belongs to.
 * Should be called once after login — typically in a layout component
 * that wraps all authenticated routes.
 *
 * Returns:
 *   - isLoading: true while fetching
 *   - hasWorkspace: true if the user has at least one workspace
 *   - error: error message if the fetch failed
 */
export const useWorkspace = () => {
  const { isSignedIn } = useAuth();
  const { setWorkspaces } = useWorkspaceStore();
  const { activeWorkspaceId } = useWorkspaceStore();
  const api = useApi();

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasWorkspace, setHasWorkspace] = useState(false);

  useEffect(() => {
    if (!isSignedIn) {
      setIsLoading(false);
      return;
    }

    let cancelled = false;

    const fetchWorkspaces = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const res = await api.get('/api/v1/workspaces/mine');
        const workspaces = res.data?.data?.workspaces ?? [];

        if (!cancelled) {
          setWorkspaces(workspaces);
          setHasWorkspace(workspaces.length > 0);
        }
      } catch (err: any) {
        if (!cancelled) {
          setError(err?.response?.data?.error?.message ?? 'Failed to load workspace');
          setHasWorkspace(false);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    fetchWorkspaces();
    return () => { cancelled = true; };
  }, [isSignedIn]);

  return { isLoading, hasWorkspace, error, activeWorkspaceId };
};
