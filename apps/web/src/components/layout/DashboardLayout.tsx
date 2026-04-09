import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { useUIStore } from '../../stores/ui.store';

export const DashboardLayout: React.FC = () => {
  const { isMobileMenuOpen, closeMobileMenu } = useUIStore();

  return (
    <div className="flex h-screen bg-background text-on-background overflow-hidden font-sans">
      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-on-surface/40 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300"
          onClick={closeMobileMenu}
        />
      )}

      {/* Sidebar - Handles its own responsive visibility classes */}
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
