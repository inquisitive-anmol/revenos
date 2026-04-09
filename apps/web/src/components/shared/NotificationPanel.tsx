import React, { useState, useEffect } from 'react';
import { useNotificationStore } from '../../stores/notification.store';
import { requestNotificationPermission } from '../../utils/notification.utils';

export const NotificationPanel: React.FC = () => {
  const { notifications, markAsRead, markAllAsRead, clearNotifications } = useNotificationStore();
  const [permissionStatus, setPermissionStatus] = useState<string>(
    'Notification' in window ? Notification.permission : 'unsupported'
  );

  const handleRequestPermission = async () => {
    const granted = await requestNotificationPermission();
    if (granted) setPermissionStatus('granted');
    else setPermissionStatus('denied');
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'prospector': return 'search';
      case 'qualifier': return 'verified';
      case 'booker': return 'event_available';
      case 'searcher': return 'manage_search';
      case 'error': return 'error';
      case 'success': return 'check_circle';
      default: return 'notifications';
    }
  };

  const getColor = (type: string) => {
    switch (type) {
      case 'prospector': return 'text-orange-500 bg-orange-50';
      case 'qualifier': return 'text-blue-500 bg-blue-50';
      case 'booker': return 'text-emerald-500 bg-emerald-50';
      case 'error': return 'text-error bg-error-container';
      default: return 'text-primary bg-primary-container/30';
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / 60000);
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="absolute right-0 mt-2 w-[380px] bg-surface border border-outline rounded-2xl shadow-2xl z-50 overflow-hidden flex flex-col">
      {/* Header */}
      <div className="px-5 py-4 border-b border-outline flex items-center justify-between bg-surface-container-low/50">
        <h3 className="font-bold text-on-surface">Notifications</h3>
        <div className="flex gap-2">
          {notifications.length > 0 && (
            <button 
              onClick={markAllAsRead}
              className="text-primary text-xs font-bold hover:underline"
            >
              Mark all read
            </button>
          )}
          <button 
            onClick={clearNotifications}
            className="text-secondary text-xs font-bold hover:underline"
          >
            Clear
          </button>
        </div>
      </div>

      {/* Browser Notification Permission Prompt */}
      {permissionStatus !== 'granted' && permissionStatus !== 'unsupported' && (
        <div className="px-5 py-3 bg-primary/5 border-b border-outline flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px] text-primary">notifications_active</span>
            <p className="text-[11px] font-medium text-on-surface-variant">Enable desktop notifications?</p>
          </div>
          <button 
            onClick={handleRequestPermission}
            className="bg-primary text-white text-[10px] font-bold py-1 px-3 rounded-full hover:bg-primary/90 transition-colors"
          >
            Enable
          </button>
        </div>
      )}

      {/* List */}
      <div className="max-h-[400px] overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="p-10 text-center flex flex-col items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-surface-container-low flex items-center justify-center">
              <span className="material-symbols-outlined text-secondary text-[24px]">notifications_off</span>
            </div>
            <p className="text-secondary text-sm font-medium">No notifications yet</p>
          </div>
        ) : (
          <div className="flex flex-col">
            {notifications.map((n) => (
              <div 
                key={n.id}
                onClick={() => !n.read && markAsRead(n.id)}
                className={`px-5 py-4 flex gap-4 hover:bg-surface-container-low/50 transition-colors cursor-pointer border-b border-outline last:border-0 ${!n.read ? 'bg-primary/5' : ''}`}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${getColor(n.type)}`}>
                  <span className="material-symbols-outlined text-[20px]">{getIcon(n.type)}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start gap-2">
                    <p className={`text-sm font-bold truncate ${!n.read ? 'text-on-surface' : 'text-on-surface-variant'}`}>
                      {n.title}
                    </p>
                    <span className="text-[10px] font-medium text-outline-variant whitespace-nowrap mt-0.5">
                      {formatTime(n.timestamp)}
                    </span>
                  </div>
                  <p className="text-xs text-secondary leading-relaxed mt-1 line-clamp-2">
                    {n.message}
                  </p>
                </div>
                {!n.read && (
                  <div className="w-2 h-2 rounded-full bg-primary mt-1.5 flex-shrink-0"></div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-5 py-3 border-t border-outline bg-surface-container-low/30 text-center">
        <button className="text-xs font-bold text-primary hover:underline">
          View all activity
        </button>
      </div>
    </div>
  );
};
