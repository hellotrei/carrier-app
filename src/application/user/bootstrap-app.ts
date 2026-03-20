import type { Order } from '../../domain/order/order';
import type { UserProfile } from '../../domain/user/user-profile';
import { initializeDatabase } from '../../data/db/sqlite/initialize-database';
import type { SqlStatementExecutor } from '../../data/db/sqlite/database-port';
import type { OrderRepositoryPort } from '../../data/repositories/order-repository-port';
import type { UserRepositoryPort } from '../../data/repositories/user-repository-port';
import type { SecureStoragePort } from '../../data/storage/secure-storage-port';
import { SECURE_STORAGE_KEYS } from '../../data/storage/secure-storage-keys';

export type BootstrapSnapshot = {
  activeOrder: Order | null;
  bootstrapDone: boolean;
  deviceBindingPresent: boolean;
  profile: UserProfile | null;
};

export type BootstrapAppDeps = {
  database: SqlStatementExecutor;
  orderRepository: OrderRepositoryPort;
  secureStorage: SecureStoragePort;
  userRepository: UserRepositoryPort;
};

export async function bootstrapApp({
  database,
  orderRepository,
  secureStorage,
  userRepository,
}: BootstrapAppDeps): Promise<BootstrapSnapshot> {
  await initializeDatabase(database);

  const [profile, activeOrder, deviceBindingId] = await Promise.all([
    userRepository.getProfile(),
    orderRepository.getActiveOrder(),
    secureStorage.get(SECURE_STORAGE_KEYS.DEVICE_BINDING_ID),
  ]);

  return {
    activeOrder,
    bootstrapDone: true,
    deviceBindingPresent: Boolean(deviceBindingId),
    profile,
  };
}
