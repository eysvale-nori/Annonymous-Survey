import { NotificationSettings } from '../types/survey';

const NOTIF_STORAGE_KEY = 'hh_survey_notification_settings';

export const getDefaultNotificationSettings = (): NotificationSettings => {
  // Default deadline is 7 days from now at 5:00 PM
  const nextWeek = new Date();
  nextWeek.setDate(nextWeek.getDate() + 7);
  nextWeek.setHours(17, 0, 0, 0);

  return {
    enabled: false,
    deadlineDate: nextWeek.toISOString().slice(0, 16), // YYYY-MM-DDTHH:mm
    reminderFrequency: 'daily',
    reminderTime: '10:00',
  };
};

export const getStoredNotificationSettings = (): NotificationSettings => {
  try {
    const raw = localStorage.getItem(NOTIF_STORAGE_KEY);
    if (raw) {
      return { ...getDefaultNotificationSettings(), ...JSON.parse(raw) };
    }
  } catch (e) {
    console.error('Error loading notification settings:', e);
  }
  return getDefaultNotificationSettings();
};

export const saveNotificationSettings = (settings: NotificationSettings) => {
  localStorage.setItem(NOTIF_STORAGE_KEY, JSON.stringify(settings));
};

export const isNotificationSupported = (): boolean => {
  return typeof window !== 'undefined' && 'Notification' in window;
};

export const getNotificationPermission = (): NotificationPermission => {
  if (!isNotificationSupported()) return 'denied';
  return Notification.permission;
};

export const requestNotificationPermission = async (): Promise<NotificationPermission> => {
  if (!isNotificationSupported()) return 'denied';
  try {
    const perm = await Notification.requestPermission();
    return perm;
  } catch (err) {
    console.error('Permission request failed:', err);
    return 'denied';
  }
};

export const sendBrowserNotification = (
  title: string,
  options?: NotificationOptions
): boolean => {
  if (!isNotificationSupported() || Notification.permission !== 'granted') {
    return false;
  }

  try {
    const notif = new Notification(title, {
      icon: 'https://images.unsplash.com/photo-1543007630-9710e4a00a20?w=128&auto=format&fit=crop&q=80',
      badge: 'https://images.unsplash.com/photo-1543007630-9710e4a00a20?w=64&auto=format&fit=crop&q=80',
      tag: 'happy-hour-survey-reminder',
      ...options,
    });

    notif.onclick = () => {
      window.focus();
      notif.close();
    };

    return true;
  } catch (err) {
    console.error('Failed to trigger notification:', err);
    return false;
  }
};

export const triggerTestNotification = async (): Promise<{ success: boolean; message: string }> => {
  if (!isNotificationSupported()) {
    return { success: false, message: 'Browser notifications are not supported in this environment.' };
  }

  let permission = Notification.permission;
  if (permission !== 'granted') {
    permission = await requestNotificationPermission();
  }

  if (permission === 'granted') {
    const success = sendBrowserNotification('🎉 Happy Hour & Engagement Survey', {
      body: 'Friendly reminder: Please share your feedback on event frequency, activities & locations to shape our next team celebration!',
      requireInteraction: false,
    });
    return {
      success,
      message: success
        ? 'Push notification dispatched! Check your desktop/device notification center.'
        : 'Notification was blocked by the system or browser.',
    };
  } else {
    return {
      success: false,
      message: 'Notification permission was denied. Please allow notifications in your browser settings.',
    };
  }
};
