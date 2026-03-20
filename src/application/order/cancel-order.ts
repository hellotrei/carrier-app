import { nowIso } from '../../core/utils/now';
import type { Result } from '../../core/result/result';
import {
  isTerminalOrderStatus,
  type Order,
  type OrderCancelReason,
} from '../../domain/order/order';
import { transitionOrder } from '../../domain/order/transition-order';
import type { OrderRepositoryPort } from '../../data/repositories/order-repository-port';

export type CancelOrderError = { code: 'INVALID_TRANSITION' };

export type CancelOrderDeps = {
  orderRepository: OrderRepositoryPort;
};

export type CancelOrderSuccess = {
  isTerminal: boolean;
  order: Order;
};

export async function cancelOrder(
  deps: CancelOrderDeps,
  order: Order,
  reason: OrderCancelReason,
): Promise<Result<CancelOrderSuccess, CancelOrderError>> {
  try {
    const nextOrder = {
      ...transitionOrder(order, 'Canceled', nowIso()),
      cancelReason: reason,
    };

    await deps.orderRepository.saveOrder(nextOrder);

    return {
      ok: true,
      value: {
        isTerminal: isTerminalOrderStatus(nextOrder.status),
        order: nextOrder,
      },
    };
  } catch {
    return {
      ok: false,
      error: { code: 'INVALID_TRANSITION' },
    };
  }
}
