import type { SecureStoragePort } from '../../data/storage/secure-storage-port';
import { SECURE_STORAGE_KEYS } from '../../data/storage/secure-storage-keys';
import type { HardwarePermissionGateway } from '../../integrations/hardware-permission/native-hardware-permission-gateway';

export type SyncNotificationTokenDeps = {
  hardwarePermissionGateway: HardwarePermissionGateway;
  secureStorage: SecureStoragePort;
};

export async function syncNotificationToken({
  hardwarePermissionGateway,
  secureStorage,
}: SyncNotificationTokenDeps): Promise<string | null> {
  const storedToken = await secureStorage.get(SECURE_STORAGE_KEYS.NOTIFICATION_TOKEN);
  const token = await hardwarePermissionGateway.getNotificationToken();

  if (!token) {
    return storedToken;
  }

  if (token !== storedToken) {
    await secureStorage.set(SECURE_STORAGE_KEYS.NOTIFICATION_TOKEN, token);
  }

  return token;
}
