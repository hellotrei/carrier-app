import type { Order } from '../../domain/order/order';
import type { OrderRepositoryPort } from './order-repository-port';

export function createInMemoryOrderRepository(
  activeOrder: Order | null = null,
): OrderRepositoryPort {
  return {
    async getActiveOrder() {
      return activeOrder;
    },
    async saveOrder(order) {
      activeOrder = order;
    },
  };
}
