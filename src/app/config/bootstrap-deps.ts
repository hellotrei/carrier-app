import { createCarrierDatabase } from '../../data/db/sqlite/carrier-database';
import { createSqliteOrderRepository } from '../../data/repositories/sqlite-order-repository';
import { createSqliteTransactionLogRepository } from '../../data/repositories/sqlite-transaction-log-repository';
import { createSqliteUserRepository } from '../../data/repositories/sqlite-user-repository';
import { createKeychainSecureStorage } from '../../data/storage/keychain-secure-storage';

const database = createCarrierDatabase();

export const bootstrapDeps = {
  database,
  orderRepository: createSqliteOrderRepository(database),
  secureStorage: createKeychainSecureStorage(),
  transactionLogRepository: createSqliteTransactionLogRepository(database),
  userRepository: createSqliteUserRepository(database),
};
