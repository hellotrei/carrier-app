import type { Order } from '../../domain/order/order';

export type OrderRepositoryPort = {
  getActiveOrder: () => Promise<Order | null>;
};
