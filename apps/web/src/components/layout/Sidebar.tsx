import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useLeadStore } from '../../stores/lead.store';
import { useUIStore } from '../../stores/ui.store';

export const Sidebar: React.FC = () => {
  const location = useLocation();
  const { leads } = useLeadStore();
  const { isMobileMenuOpen, closeMobileMenu } = useUIStore();

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: 'grid_view' },
    { name: 'Agents', path: '/agents', icon: 'smart_toy' },
    { name: 'Campaigns', path: '/campaigns', icon: 'campaign', fill: true },
    { name: 'Pipeline', path: '/pipeline', icon: 'alt_route' },
    { name: 'Leads', path: '/leads', icon: 'group', fill: true },
    { name: 'Meetings', path: '/meetings', icon: 'event_available' },
    { name: 'Analytics', path: '/analytics', icon: 'analytics', fill: true },
    { name: 'Settings', path: '/settings', icon: 'settings' },
  ];

  const isActive = (path: string) =>
    path === '/agents'
      ? location.pathname.startsWith('/agents')
      : location.pathname === path;


  return (
    <aside className={`
      fixed inset-y-0 left-0 z-50 w-64 bg-surface border-r border-outline flex flex-col shrink-0 transition-transform duration-300 ease-in-out
      lg:relative lg:translate-x-0 overflow-y-auto
      ${isMobileMenuOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full lg:translate-x-0'}
    `}>
      {/* Brand Section */}
      <div className="p-6 flex items-center justify-between lg:justify-start gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-md shadow-primary/20 flex-shrink-0">
            <span className="material-symbols-outlined text-white text-[22px]" style={{ fontVariationSettings: "'FILL' 1" }}>rocket_launch</span>
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-extrabold tracking-tighter text-primary leading-none">RevenOS</span>
            <span className="text-[9px] font-bold tracking-widest text-secondary uppercase mt-1">Precision Velocity</span>
          </div>
        </div>
        
        {/* Mobile Close Button */}
        <button 
          onClick={closeMobileMenu}
          className="lg:hidden p-2 text-secondary hover:text-on-surface hover:bg-surface-container-low rounded-lg transition-colors"
        >
          <span className="material-symbols-outlined">close</span>
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 space-y-1.5 mt-2">
        <h3 className="px-4 text-[11px] uppercase tracking-widest text-secondary font-bold mb-3">Main Menu</h3>
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            onClick={() => {
              if (window.innerWidth < 1024) closeMobileMenu();
            }}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all font-semibold text-sm ${
              isActive(item.path)
                ? 'bg-primary-container/50 text-primary shadow-sm'
                : 'text-secondary hover:text-on-surface hover:bg-surface-container-low'
            }`}
          >
            <span 
              className="material-symbols-outlined text-[22px]"
              style={{ fontVariationSettings: item.fill || isActive(item.path) ? "'FILL' 1" : "" }}
            >
              {item.icon}
            </span>
            {item.name}
          </Link>
        ))}
      </nav>

      {/* Bottom Section */}
      <div className="p-4 border-t border-outline flex flex-col gap-4">
        {/* Storage Usage */}
        <div className="bg-surface-container-low/50 rounded-xl p-4 border border-outline">
          <p className="text-[10px] font-bold text-primary uppercase tracking-widest mb-2">Storage Usage</p>
          <div className="w-full bg-surface-container-high h-1.5 rounded-full overflow-hidden mb-2">
            <div
              className="bg-primary h-full rounded-full transition-all"
              style={{ width: `${Math.min((leads.length / 10000) * 100, 100)}%` }}
            ></div>
          </div>
          <p className="text-[11px] text-secondary font-medium">{leads.length.toLocaleString()} of 10k leads used</p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2">
          <Link 
            to="/campaigns/create" 
            onClick={() => {
              if (window.innerWidth < 1024) closeMobileMenu();
            }}
            className="w-full bg-primary text-white py-2.5 rounded-xl text-sm font-bold shadow-md shadow-primary/20 hover:bg-on-primary-fixed-variant active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-[20px]">add_circle</span>
            New Campaign
          </Link>
          <button 
            className="w-full flex items-center gap-3 px-4 py-2.5 text-secondary hover:text-on-surface hover:bg-surface-container-low rounded-lg transition-all font-semibold text-sm"
          >
            <span className="material-symbols-outlined text-[22px]">contact_support</span>
            Help Centre
          </button>
        </div>
      </div>
    </aside>
  );
};
