import { useAuth, useUser, UserButton } from '@clerk/clerk-react';
import { Navigate } from 'react-router-dom';

export default function Dashboard() {
  const { isSignedIn, isLoaded } = useAuth();
  const { user } = useUser();

  if (!isLoaded) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!isSignedIn) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="bg-background min-h-screen">
      <header className="bg-surface shadow-sm border-b border-outline px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>bolt</span>
          <span className="text-xl font-bold text-on-surface tracking-tight">SalesForge</span>
        </div>
        
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-on-surface-variant">
            {user?.firstName} {user?.lastName}
          </span>
          <UserButton afterSignOutUrl="/" />
        </div>
      </header>

      <main className="p-8 max-w-7xl mx-auto">
        <h1 className="text-3xl font-extrabold text-on-surface mb-2">Dashboard</h1>
        <p className="text-on-surface-variant mb-8">Welcome back. Here's what's happening with your outreach today.</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-surface border border-outline rounded-xl p-6 shadow-sm">
            <h3 className="text-sm font-bold text-secondary uppercase tracking-wider mb-2">Total Leads</h3>
            <p className="text-4xl font-black text-on-surface">1,245</p>
          </div>
          <div className="bg-surface border border-outline rounded-xl p-6 shadow-sm">
            <h3 className="text-sm font-bold text-secondary uppercase tracking-wider mb-2">Active Campaigns</h3>
            <p className="text-4xl font-black text-on-surface">12</p>
          </div>
          <div className="bg-surface border border-outline rounded-xl p-6 shadow-sm">
            <h3 className="text-sm font-bold text-secondary uppercase tracking-wider mb-2">Meetings Booked</h3>
            <p className="text-4xl font-black text-on-surface">84</p>
          </div>
        </div>
      </main>
    </div>
  );
}
