import { create } from 'zustand';

export type PermissionStatus = 'idle' | 'granted' | 'denied';

type PermissionStore = {
  lastNotificationPreview: string | null;
  locationPermissionStatus: PermissionStatus;
  notificationPermissionStatus: PermissionStatus;
  notificationTokenPreview: string | null;
  resetPermissionState: () => void;
  setLastNotificationPreview: (preview: string | null) => void;
  setLocationPermissionStatus: (status: PermissionStatus) => void;
  setNotificationPermissionStatus: (status: PermissionStatus) => void;
  setNotificationTokenPreview: (tokenPreview: string | null) => void;
};

export const usePermissionStore = create<PermissionStore>(set => ({
  lastNotificationPreview: null,
  locationPermissionStatus: 'idle',
  notificationPermissionStatus: 'idle',
  notificationTokenPreview: null,
  resetPermissionState: () =>
    set({
      lastNotificationPreview: null,
      locationPermissionStatus: 'idle',
      notificationPermissionStatus: 'idle',
      notificationTokenPreview: null,
    }),
  setLastNotificationPreview: lastNotificationPreview =>
    set({ lastNotificationPreview }),
  setLocationPermissionStatus: locationPermissionStatus =>
    set({ locationPermissionStatus }),
  setNotificationPermissionStatus: notificationPermissionStatus =>
    set({ notificationPermissionStatus }),
  setNotificationTokenPreview: notificationTokenPreview =>
    set({ notificationTokenPreview }),
}));
