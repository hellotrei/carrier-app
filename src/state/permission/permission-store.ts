import { create } from 'zustand';

export type PermissionStatus = 'idle' | 'granted' | 'denied';

type PermissionStore = {
  locationPermissionStatus: PermissionStatus;
  notificationPermissionStatus: PermissionStatus;
  notificationTokenPreview: string | null;
  resetPermissionState: () => void;
  setLocationPermissionStatus: (status: PermissionStatus) => void;
  setNotificationPermissionStatus: (status: PermissionStatus) => void;
  setNotificationTokenPreview: (tokenPreview: string | null) => void;
};

export const usePermissionStore = create<PermissionStore>(set => ({
  locationPermissionStatus: 'idle',
  notificationPermissionStatus: 'idle',
  notificationTokenPreview: null,
  resetPermissionState: () =>
    set({
      locationPermissionStatus: 'idle',
      notificationPermissionStatus: 'idle',
      notificationTokenPreview: null,
    }),
  setLocationPermissionStatus: locationPermissionStatus =>
    set({ locationPermissionStatus }),
  setNotificationPermissionStatus: notificationPermissionStatus =>
    set({ notificationPermissionStatus }),
  setNotificationTokenPreview: notificationTokenPreview =>
    set({ notificationTokenPreview }),
}));
