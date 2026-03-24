import { create } from 'zustand';

import type { NotificationEvent } from './notification-event';

export type PermissionStatus = 'idle' | 'granted' | 'denied';

type PermissionStore = {
  lastNotificationEvent: NotificationEvent | null;
  locationPermissionStatus: PermissionStatus;
  notificationPermissionStatus: PermissionStatus;
  notificationTokenPreview: string | null;
  resetPermissionState: () => void;
  setLastNotificationEvent: (event: NotificationEvent | null) => void;
  setLocationPermissionStatus: (status: PermissionStatus) => void;
  setNotificationPermissionStatus: (status: PermissionStatus) => void;
  setNotificationTokenPreview: (tokenPreview: string | null) => void;
};

export const usePermissionStore = create<PermissionStore>(set => ({
  lastNotificationEvent: null,
  locationPermissionStatus: 'idle',
  notificationPermissionStatus: 'idle',
  notificationTokenPreview: null,
  resetPermissionState: () =>
    set({
      lastNotificationEvent: null,
      locationPermissionStatus: 'idle',
      notificationPermissionStatus: 'idle',
      notificationTokenPreview: null,
    }),
  setLastNotificationEvent: lastNotificationEvent =>
    set({ lastNotificationEvent }),
  setLocationPermissionStatus: locationPermissionStatus =>
    set({ locationPermissionStatus }),
  setNotificationPermissionStatus: notificationPermissionStatus =>
    set({ notificationPermissionStatus }),
  setNotificationTokenPreview: notificationTokenPreview =>
    set({ notificationTokenPreview }),
}));
