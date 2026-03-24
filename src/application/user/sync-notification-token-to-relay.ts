import type { SecureStoragePort } from '../../data/storage/secure-storage-port';
import { SECURE_STORAGE_KEYS } from '../../data/storage/secure-storage-keys';
import type { NotificationRelayGateway } from '../../integrations/notification-relay/notification-relay-gateway';
import type { SyncNotificationTokenDeps } from './sync-notification-token';
import { syncNotificationToken } from './sync-notification-token';

export type SyncNotificationTokenToRelayDeps = SyncNotificationTokenDeps & {
  notificationRelayGateway: NotificationRelayGateway;
  secureStorage: SecureStoragePort;
};

export async function syncNotificationTokenToRelay({
  notificationRelayGateway,
  ...deps
}: SyncNotificationTokenToRelayDeps): Promise<string | null> {
  const token = await syncNotificationToken(deps);

  if (!token) {
    return null;
  }

  const syncedToken = await deps.secureStorage.get(
    SECURE_STORAGE_KEYS.NOTIFICATION_TOKEN_SYNCED,
  );

  if (syncedToken === token) {
    return token;
  }

  await notificationRelayGateway.syncNotificationToken({ token });
  await deps.secureStorage.set(SECURE_STORAGE_KEYS.NOTIFICATION_TOKEN_SYNCED, token);

  return token;
}
