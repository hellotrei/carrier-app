import type { Order } from '../../domain/order/order';

export type HistoryFilter = 'all' | 'completed' | 'canceled';

export type OrderRepositoryPort = {
  getActiveOrder: () => Promise<Order | null>;
  getOrderById: (orderId: Order['orderId']) => Promise<Order | null>;
  listHistory: (filter: HistoryFilter) => Promise<Order[]>;
  saveOrder: (order: Order) => Promise<void>;
};
