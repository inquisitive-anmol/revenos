import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

export const DashboardLayout: React.FC = () => {
  return (
    <div className="flex h-screen bg-background text-on-background overflow-hidden font-sans">
      {/* Fixed Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Fixed Header */}
        <Header />

        {/* Scrollable Body */}
        <main className="flex-1 overflow-y-auto min-h-0 bg-background relative">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
