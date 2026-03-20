import type { SecureStoragePort } from './secure-storage-port';

export function createInMemorySecureStorage(): SecureStoragePort {
  const values = new Map<string, string>();

  return {
    async get(key) {
      return values.get(key) ?? null;
    },
    async set(key, value) {
      values.set(key, value);
    },
  };
}
