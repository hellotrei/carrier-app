import type { Order } from '../../domain/order/order';
import { isTerminalOrderStatus } from '../../domain/order/order';
import type { OrderRepositoryPort } from './order-repository-port';

export function createInMemoryOrderRepository(
  activeOrder: Order | null = null,
): OrderRepositoryPort {
  let orders = activeOrder ? [activeOrder] : [];

  return {
    async getActiveOrder() {
      const activeOrders = orders.filter(
        order => !isTerminalOrderStatus(order.status),
      );

      return activeOrders[activeOrders.length - 1] ?? null;
    },
    async getOrderById(orderId) {
      return orders.find(order => order.orderId === orderId) ?? null;
    },
    async listHistory(filter) {
      return orders.filter(order => {
        if (order.status !== 'Completed' && order.status !== 'Canceled') {
          return false;
        }

        if (filter === 'completed') {
          return order.status === 'Completed';
        }

        if (filter === 'canceled') {
          return order.status === 'Canceled';
        }

        return true;
      });
    },
    async saveOrder(order) {
      orders = orders.filter(current => current.orderId !== order.orderId);
      orders.push(order);
    },
  };
}
