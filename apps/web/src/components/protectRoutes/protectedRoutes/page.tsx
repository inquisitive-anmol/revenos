import { useAuth } from '@clerk/clerk-react';
import { Navigate, Outlet } from 'react-router-dom';
import { useWorkspace } from '../../../hooks/useWorkspace';

export default function ProtectedRoute() {
  const { isLoaded, isSignedIn } = useAuth();
  const { isLoading: isWorkspaceLoading, hasWorkspace } = useWorkspace();

  // Wait for Clerk to initialize
  if (!isLoaded) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading RevenOs...</div>;
  }

  // If not logged in, redirect to login page
  if (!isSignedIn) {
    return <Navigate to="/login" replace />;
  }

  // Wait for workspace to be resolved
  if (isWorkspaceLoading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        Setting up your workspace...
      </div>
    );
  }

  // Workspace provisioning hasn't completed yet (Clerk webhook still processing)
  // Show a friendly message and auto-retry
  if (!hasWorkspace) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <p>Your workspace is being set up. Please wait a moment and refresh.</p>
        <button onClick={() => window.location.reload()} style={{ marginTop: '1rem' }}>
          Refresh
        </button>
      </div>
    );
  }

  // Workspace resolved — render child routes
  return <Outlet />;
}