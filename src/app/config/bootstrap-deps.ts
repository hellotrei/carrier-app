import { createCarrierDatabase } from '../../data/db/sqlite/carrier-database';
import { createSqliteAuditRepository } from '../../data/repositories/sqlite-audit-repository';
import { createSqliteOrderRepository } from '../../data/repositories/sqlite-order-repository';
import { createSqliteTransactionLogRepository } from '../../data/repositories/sqlite-transaction-log-repository';
import { createSqliteUserRepository } from '../../data/repositories/sqlite-user-repository';
import { createNativeFileExportGateway } from '../../integrations/file-export/native-file-export-gateway';
import { createKeychainSecureStorage } from '../../data/storage/keychain-secure-storage';

const database = createCarrierDatabase();

export const bootstrapDeps = {
  auditRepository: createSqliteAuditRepository(database),
  database,
  fileExportGateway: createNativeFileExportGateway(),
  orderRepository: createSqliteOrderRepository(database),
  secureStorage: createKeychainSecureStorage(),
  transactionLogRepository: createSqliteTransactionLogRepository(database),
  userRepository: createSqliteUserRepository(database),
};
