export type SecureStoragePort = {
  get: (key: string) => Promise<string | null>;
  set: (key: string, value: string) => Promise<void>;
};
