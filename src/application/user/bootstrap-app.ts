import type { Order } from '../../domain/order/order';
import type { UserProfile } from '../../domain/user/user-profile';
import { initializeDatabase } from '../../data/db/sqlite/initialize-database';
import type { SqlStatementExecutor } from '../../data/db/sqlite/database-port';
import type { OrderRepositoryPort } from '../../data/repositories/order-repository-port';
import type { UserRepositoryPort } from '../../data/repositories/user-repository-port';
import type { SecureStoragePort } from '../../data/storage/secure-storage-port';
import { SECURE_STORAGE_KEYS } from '../../data/storage/secure-storage-keys';
import type { ResumeTarget } from '../../state/app-shell/app-shell-selectors';
import { resolveResumeTarget } from '../../state/app-shell/app-shell-selectors';

export type BootstrapSnapshot = {
  activeOrder: Order | null;
  bootstrapDone: boolean;
  deviceBindingPresent: boolean;
  profile: UserProfile | null;
  resumeTarget: ResumeTarget;
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

  const [profile, deviceBindingId] = await Promise.all([
    userRepository.getProfile(),
    secureStorage.get(SECURE_STORAGE_KEYS.DEVICE_BINDING_ID),
  ]);
  let activeOrder: Order | null = null;

  try {
    activeOrder = await orderRepository.getActiveOrder();
  } catch {
    // Recovery should fail closed for the active order path without blocking shell bootstrap.
    activeOrder = null;
  }

  return {
    activeOrder,
    bootstrapDone: true,
    deviceBindingPresent: Boolean(deviceBindingId),
    profile,
    resumeTarget: resolveResumeTarget(activeOrder),
  };
}
