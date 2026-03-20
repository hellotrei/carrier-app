import { createInMemoryDatabase } from '../../data/db/sqlite/in-memory-database';
import { createInMemoryOrderRepository } from '../../data/repositories/in-memory-order-repository';
import { createInMemoryUserRepository } from '../../data/repositories/in-memory-user-repository';
import { createInMemorySecureStorage } from '../../data/storage/in-memory-secure-storage';

export const bootstrapDeps = {
  database: createInMemoryDatabase(),
  orderRepository: createInMemoryOrderRepository(),
  secureStorage: createInMemorySecureStorage(),
  userRepository: createInMemoryUserRepository(),
};
