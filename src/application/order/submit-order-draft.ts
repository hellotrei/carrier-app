import { nowIso } from '../../core/utils/now';
import type { Result } from '../../core/result/result';
import type { Order } from '../../domain/order/order';
import { transitionOrder } from '../../domain/order/transition-order';
import type { OrderRepositoryPort } from '../../data/repositories/order-repository-port';

export type SubmitOrderDraftError = {
  code: 'INVALID_ORDER_STATUS';
};

export type SubmitOrderDraftDeps = {
  orderRepository: OrderRepositoryPort;
};

export async function submitOrderDraft(
  deps: SubmitOrderDraftDeps,
  order: Order,
): Promise<Result<Order, SubmitOrderDraftError>> {
  if (order.status !== 'Draft') {
    return {
      ok: false,
      error: { code: 'INVALID_ORDER_STATUS' },
    };
  }

  const requestedAt = nowIso();
  const requestedOrder = {
    ...transitionOrder(order, 'Requested', requestedAt),
    requestedAt,
  };

  await deps.orderRepository.saveOrder(requestedOrder);

  return {
    ok: true,
    value: requestedOrder,
  };
}
