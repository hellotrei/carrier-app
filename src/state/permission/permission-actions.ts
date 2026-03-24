import messaging, {
  type FirebaseMessagingTypes,
} from '@react-native-firebase/messaging';

import type { BootstrapDependencies } from '../../app/config/bootstrap-deps';
import { syncNotificationTokenToRelay } from '../../application/user/sync-notification-token-to-relay';
import { normalizeNotificationEvent } from './notification-event';
import { usePermissionStore } from './permission-store';

function toTokenPreview(token: string | null): string | null {
  return token ? `${token.slice(0, 6)}...${token.slice(-4)}` : null;
}

export async function handleBackgroundNotificationMessage(
  message: FirebaseMessagingTypes.RemoteMessage,
) {
  usePermissionStore.setState({
    lastNotificationEvent: normalizeNotificationEvent(message),
  });
}

export async function loadHardwarePermissionState(
  deps: BootstrapDependencies,
) {
  try {
    const [locationStatus, notificationStatus, notificationToken] =
      await Promise.all([
        deps.hardwarePermissionGateway.getLocationWhenInUseStatus(),
        deps.hardwarePermissionGateway.getNotificationStatus(),
        syncNotificationTokenToRelay(deps),
      ]);

    usePermissionStore.setState({
      locationPermissionStatus: locationStatus,
      notificationPermissionStatus: notificationStatus,
      notificationTokenPreview: toTokenPreview(notificationToken),
    });
  } catch {
    usePermissionStore.setState({
      notificationTokenPreview: null,
    });
  }
}

export async function requestLocationPermission(
  deps: BootstrapDependencies,
) {
  try {
    const granted =
      await deps.hardwarePermissionGateway.requestLocationWhenInUse();

    usePermissionStore.setState({
      locationPermissionStatus: granted ? 'granted' : 'denied',
    });
  } catch {
    usePermissionStore.setState({
      locationPermissionStatus: 'denied',
    });
  }
}

export async function requestNotificationPermission(
  deps: BootstrapDependencies,
) {
  try {
    const granted =
      await deps.hardwarePermissionGateway.requestNotifications();

    if (!granted) {
      usePermissionStore.setState({
        notificationPermissionStatus: 'denied',
        notificationTokenPreview: null,
      });
      return;
    }

    const token = await syncNotificationTokenToRelay(deps);

    usePermissionStore.setState({
      notificationPermissionStatus: 'granted',
      notificationTokenPreview: toTokenPreview(token),
    });
  } catch {
    usePermissionStore.setState({
      notificationPermissionStatus: 'denied',
      notificationTokenPreview: null,
    });
  }
}

export async function initializeNotificationRuntime() {
  try {
    await messaging().registerDeviceForRemoteMessages();
  } catch {
    // Keep runtime best-effort; permission/token flow stays authoritative.
  }

  const initialNotification = await messaging().getInitialNotification();

  if (initialNotification) {
    usePermissionStore.setState({
      lastNotificationEvent: normalizeNotificationEvent(initialNotification),
    });
  }

  const unsubscribeForeground = messaging().onMessage(message => {
    void handleBackgroundNotificationMessage(message);
  });

  const unsubscribeOpened = messaging().onNotificationOpenedApp(message => {
    void handleBackgroundNotificationMessage(message);
  });

  return () => {
    unsubscribeForeground();
    unsubscribeOpened();
  };
}
