import React, { useState, useRef, useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import { useNotificationStore } from '../../stores/notification.store';
import { useUIStore } from '../../stores/ui.store';
import { NotificationPanel } from '../shared/NotificationPanel';

export const Header: React.FC = () => {
  const { user } = useUser();
  const { unstyledCount } = useNotificationStore();
  const { toggleMobileMenu } = useUIStore();
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Handle clicking outside notifications
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setIsNotificationsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="h-20 bg-surface/80 backdrop-blur-md border-b border-outline flex items-center justify-between px-4 md:px-8 shrink-0 z-20">
      
      {/* Left: Mobile Menu + Logo (mobile only) */}
      <div className="flex items-center gap-4">
        <button 
          onClick={toggleMobileMenu}
          className="lg:hidden p-2 text-secondary hover:text-on-surface hover:bg-surface-container-low rounded-lg transition-colors"
        >
          <span className="material-symbols-outlined text-[24px]">menu</span>
        </button>
        
        {/* Search Bar - Hidden on very small screens, or scaled */}
        <div className="relative w-full max-w-[200px] md:max-w-md hidden sm:block">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-secondary text-[20px]">
            search
          </span>
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-surface-container-low border-none rounded-lg focus:ring-2 focus:ring-primary outline-none transition-all text-sm placeholder:text-secondary font-medium"
          />
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-3 md:gap-6">
        
        {/* Search Icon (Mobile Only) */}
        <button className="sm:hidden text-secondary hover:text-on-surface transition-colors p-2 rounded-full hover:bg-surface-container-low">
          <span className="material-symbols-outlined text-[24px]">search</span>
        </button>

        {/* Notifications */}
        <div className="relative" ref={notificationRef}>
          <button 
            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
            className={`relative text-secondary hover:text-on-surface transition-colors p-1 rounded-full hover:bg-surface-container-low ${isNotificationsOpen ? 'text-primary bg-surface-container-low' : ''}`}
          >
            <span className="material-symbols-outlined text-[24px]" style={{ fontVariationSettings: isNotificationsOpen ? "'FILL' 1" : "" }}>
              notifications
            </span>
            {unstyledCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-error text-white text-[10px] font-bold rounded-full border border-surface flex items-center justify-center">
                {unstyledCount > 9 ? '9+' : unstyledCount}
              </span>
            )}
          </button>

          {isNotificationsOpen && <NotificationPanel />}
        </div>

        <div className="h-8 w-px bg-outline mx-1 hidden md:block"></div>

        {/* User Profile */}
        <button className="flex items-center gap-2 md:gap-3 text-left group">
          <div className="hidden md:flex flex-col text-right">
            <span className="text-sm font-bold text-on-surface leading-tight group-hover:text-primary transition-colors">
              {user?.fullName || user?.firstName || "User"}
            </span>
            <span className="text-[10px] font-bold text-secondary uppercase tracking-wider mt-0.5">Admin Account</span>
          </div>
          <div className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden border border-outline shadow-sm">
            {user?.imageUrl
              ? <img src={user.imageUrl} alt="avatar" className="w-full h-full object-cover" />
              : <div className="w-full h-full flex items-center justify-center bg-primary/10 text-primary font-bold text-sm">
                  {user?.firstName?.[0]}
                </div>
            }
          </div>
          <span className="material-symbols-outlined text-secondary text-[20px] hidden sm:block">expand_more</span>
        </button>
      </div>
    </header>
  );
};
