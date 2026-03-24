import { nowIso } from '../../core/utils/now';
import { SECURE_STORAGE_KEYS } from '../../data/storage/secure-storage-keys';
import type { SecureStoragePort } from '../../data/storage/secure-storage-port';
import type { DeviceAuthGateway } from '../../integrations/device-auth/native-device-auth-gateway';

type GuardExportWithDeviceAuthDeps = {
  deviceAuthGateway: DeviceAuthGateway;
  secureStorage: SecureStoragePort;
};

export async function guardExportWithDeviceAuth(
  deps: GuardExportWithDeviceAuthDeps,
  promptMessage: string,
): Promise<void> {
  const guardEnabled = await deps.secureStorage.get(
    SECURE_STORAGE_KEYS.AUDIT_EXPORT_GUARD_ENABLED,
  );

  if (guardEnabled === '0') {
    return;
  }

  await deps.deviceAuthGateway.authenticate(promptMessage);
  await deps.secureStorage.set(SECURE_STORAGE_KEYS.LAST_AUTHENTICATED_AT, nowIso());
}
