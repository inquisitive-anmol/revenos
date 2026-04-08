import { useAuth } from '@clerk/clerk-react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthSync } from '../../../hooks/useAuthSync';
import { useWorkspaceStore } from '../../../stores/workspace.store';
import { useRealtimeWorkers } from '../../../hooks/useRealtimeWorkers';

export default function ProtectedRoute() {
  const { isLoaded, isSignedIn } = useAuth();
  const { isSyncing, isSynced, syncError } = useAuthSync();
  const { workspaces } = useWorkspaceStore();

  // Spin up real-time connection for synced users to safely subscribe to workspaces
  useRealtimeWorkers();

  // 1. Wait for Clerk to initialise
  if (!isLoaded) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading RevenOs...</div>;
  }

  // 2. Not signed in → redirect to login
  if (!isSignedIn) {
    return <Navigate to="/login" replace />;
  }

  // 3. Show friendly spinner while syncing to DB / provisioning workspace
  // 3. If workspaces already in store (from localStorage), skip the sync wait
  if ((isSyncing || !isSynced) && workspaces.length === 0) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Setting up your account...</div>;
  }

  // 4. Sync failed — show error with a retry option
  if (syncError) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <p style={{ color: 'red' }}>{syncError}</p>
        <button onClick={() => window.location.reload()} style={{ marginTop: '1rem' }}>
          Retry
        </button>
      </div>
    );
  }

  // 5. Sync done but no workspace found (edge case — provisioning may have failed silently)
  if (workspaces.length === 0) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <p>Your workspace is being set up. Please wait a moment and refresh.</p>
        <button onClick={() => window.location.reload()} style={{ marginTop: '1rem' }}>
          Refresh
        </button>
      </div>
    );
  }

  // 6. All good — render protected content
  return <Outlet />;
}