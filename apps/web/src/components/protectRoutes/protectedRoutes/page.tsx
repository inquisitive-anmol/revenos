// components/ProtectedRoute.tsx
import { useAuth } from '@clerk/clerk-react';
import { Navigate, Outlet } from 'react-router-dom';

export default function ProtectedRoute() {
  const { isLoaded, isSignedIn } = useAuth();

  // Wait for Clerk to initialize before making routing decisions
  if (!isLoaded) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading RevenOs...</div>;
  }

  // If not logged in, redirect to login page
  if (!isSignedIn) {
    return <Navigate to="/login" replace />;
  }

  // If logged in, render the protected child routes
  return <Outlet />;
}