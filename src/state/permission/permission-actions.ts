import { syncNotificationToken } from '../../application/user/sync-notification-token';
import type { BootstrapDependencies } from '../../app/config/bootstrap-deps';
import { usePermissionStore } from './permission-store';

function toTokenPreview(token: string | null): string | null {
  return token ? `${token.slice(0, 6)}...${token.slice(-4)}` : null;
}

export async function loadHardwarePermissionState(
  deps: BootstrapDependencies,
) {
  try {
    const [locationStatus, notificationStatus, notificationToken] =
      await Promise.all([
        deps.hardwarePermissionGateway.getLocationWhenInUseStatus(),
        deps.hardwarePermissionGateway.getNotificationStatus(),
        syncNotificationToken(deps),
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

    const token = await syncNotificationToken(deps);

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
