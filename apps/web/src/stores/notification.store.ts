import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface Notification {
  id: string;
  type: 'prospector' | 'qualifier' | 'booker' | 'searcher' | 'system' | 'error' | 'success';
  title: string;
  message: string;
  read: boolean;
  timestamp: string;
  metadata?: any;
}

interface NotificationState {
  notifications: Notification[];
  unstyledCount: number; // For badge
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearNotifications: () => void;
}

export const useNotificationStore = create<NotificationState>()(
  persist(
    (set) => ({
      notifications: [],
      unstyledCount: 0,
      addNotification: (notification) => {
        set((state) => {
          const newNotification: Notification = {
            ...notification,
            id: Math.random().toString(36).substring(2, 11),
            timestamp: new Date().toISOString(),
            read: false,
          };
          return {
            notifications: [newNotification, ...state.notifications].slice(0, 100), // Keep last 100
            unstyledCount: state.notifications.filter(n => !n.read).length + 1,
          };
        });
      },
      markAsRead: (id) => {
        set((state) => ({
          notifications: state.notifications.map((n) =>
            n.id === id ? { ...n, read: true } : n
          ),
          unstyledCount: Math.max(0, state.notifications.filter(n => !n.read && n.id !== id).length),
        }));
      },
      markAllAsRead: () => {
        set((state) => ({
          notifications: state.notifications.map((n) => ({ ...n, read: true })),
          unstyledCount: 0,
        }));
      },
      clearNotifications: () => set({ notifications: [], unstyledCount: 0 }),
    }),
    {
      name: 'revenos-notifications',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
