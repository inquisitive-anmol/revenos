import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';

export default function Home() {
  const { isSignedIn, isLoaded } = useAuth();

  // If already authenticated and loaded, redirect to dashboard automatically
  if (isLoaded && isSignedIn) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="bg-background min-h-screen flex flex-col items-center justify-center px-4 text-center">
      <div className="w-16 h-16 bg-primary rounded-xl shadow-lg flex items-center justify-center mb-6">
        <span className="material-symbols-outlined text-white text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>bolt</span>
      </div>
      <h1 className="text-4xl md:text-5xl font-extrabold text-on-surface mb-4 tracking-tight">Welcome to SalesForge AI</h1>
      <p className="text-lg text-on-surface-variant max-w-lg mb-10">
        Precision outreach at scale. Please sign in or create an account to access your dashboard.
      </p>
      
      <div className="flex flex-col sm:flex-row gap-4 w-full justify-center max-w-md">
        <Link 
          to="/login"
          className="bg-primary text-white font-bold py-3 px-8 rounded-lg shadow hover:bg-blue-600 transition-colors flex-1"
        >
          Sign In
        </Link>
        <Link 
          to="/register"
          className="bg-surface text-on-surface border border-outline font-bold py-3 px-8 rounded-lg shadow-sm hover:bg-surface-container-low transition-colors flex-1"
        >
          Sign Up
        </Link>
      </div>
    </div>
  );
}
