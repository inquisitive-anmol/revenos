import toast from 'react-hot-toast';
import { useNotificationStore } from '../stores/notification.store';

export type NotificationType = 'prospector' | 'qualifier' | 'booker' | 'searcher' | 'system' | 'error' | 'success';

interface ShowNotificationOptions {
  title: string;
  message: string;
  type: NotificationType;
  metadata?: any;
  showToast?: boolean;
  showBrowser?: boolean;
}

export const notify = ({
  title,
  message,
  type,
  metadata,
  showToast = true,
  showBrowser = true,
}: ShowNotificationOptions) => {
  // 1. Add to In-App store
  const { addNotification } = useNotificationStore.getState();
  addNotification({
    title,
    message,
    type,
    metadata,
  });

  // 2. Show Toast
  if (showToast) {
    if (type === 'error') {
      toast.error(`${title}: ${message}`);
    } else {
      toast.success(message || title);
    }
  }

  // 3. Show Browser Notification
  if (showBrowser && 'Notification' in window) {
    if (Notification.permission === 'granted') {
      new Notification(title, {
        body: message,
        icon: '/logo.png', // Fallback to a logo if available
      });
    }
  }
};

export const requestNotificationPermission = async () => {
  if (!('Notification' in window)) {
    console.warn('This browser does not support desktop notification');
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  return false;
};
