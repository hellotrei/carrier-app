import { nowIso } from '../../core/utils/now';
import type { Result } from '../../core/result/result';
import {
  isTerminalOrderStatus,
  type Order,
  type OrderStatus,
} from '../../domain/order/order';
import { transitionOrder } from '../../domain/order/transition-order';
import type { OrderRepositoryPort } from '../../data/repositories/order-repository-port';

export type AdvanceOrderStatusError = { code: 'INVALID_TRANSITION' };

export type AdvanceOrderStatusDeps = {
  orderRepository: OrderRepositoryPort;
};

export type AdvanceOrderStatusSuccess = {
  isTerminal: boolean;
  order: Order;
};

export async function advanceOrderStatus(
  deps: AdvanceOrderStatusDeps,
  order: Order,
  nextStatus: OrderStatus,
): Promise<Result<AdvanceOrderStatusSuccess, AdvanceOrderStatusError>> {
  try {
    const nextOrder = transitionOrder(order, nextStatus, nowIso());

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
