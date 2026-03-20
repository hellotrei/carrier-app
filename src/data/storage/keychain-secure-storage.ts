import * as Keychain from 'react-native-keychain';

import type { SecureStoragePort } from './secure-storage-port';

const SERVICE_PREFIX = 'carrier.secure';

function buildServiceName(key: string): string {
  return `${SERVICE_PREFIX}.${key}`;
}

export function createKeychainSecureStorage(): SecureStoragePort {
  return {
    async get(key) {
      const credentials = await Keychain.getGenericPassword({
        service: buildServiceName(key),
      });

      if (!credentials) {
        return null;
      }

      return credentials.password;
    },
    async set(key, value) {
      await Keychain.setGenericPassword(key, value, {
        service: buildServiceName(key),
      });
    },
  };
}
