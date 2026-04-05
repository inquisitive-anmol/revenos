// components/PublicAuthRoute.tsx
import { useAuth } from '@clerk/clerk-react';
import { Navigate, Outlet } from 'react-router-dom';

export default function PublicAuthRoute() {
  const { isLoaded, isSignedIn } = useAuth();

  if (!isLoaded) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>;
  }

  // If already logged in, push them to the dashboard
  if (isSignedIn) {
    return <Navigate to="/dashboard" replace />;
  }

  // If not logged in, allow them to see the auth forms
  return <Outlet />;
}