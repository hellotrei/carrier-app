import type { AuditRepositoryPort } from '../../data/repositories/audit-repository-port';
import { nowIso } from '../../core/utils/now';
import type { Result } from '../../core/result/result';
import {
  canCancelOrderWithReason,
  isTerminalOrderStatus,
  type Order,
  type OrderCancelReason,
} from '../../domain/order/order';
import { transitionOrder } from '../../domain/order/transition-order';
import type { OrderRepositoryPort } from '../../data/repositories/order-repository-port';
import { buildAuditEvent } from './build-audit-event';

export type CancelOrderError =
  | { code: 'INVALID_TRANSITION' }
  | { code: 'INVALID_CANCEL_REASON' };

export type CancelOrderDeps = {
  auditRepository: AuditRepositoryPort;
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
  if (!canCancelOrderWithReason(order.status, reason)) {
    return {
      ok: false,
      error: { code: 'INVALID_CANCEL_REASON' },
    };
  }

  try {
    const nextOrder = {
      ...transitionOrder(order, 'Canceled', nowIso()),
      cancelReason: reason,
    };

    await deps.orderRepository.saveOrder(nextOrder);
    await deps.auditRepository.appendEvent(
      buildAuditEvent({
        actorRole: 'mitra',
        actorUserId: nextOrder.partnerId,
        eventType: 'ORDER_CANCELED',
        orderId: nextOrder.orderId,
        payload: {
          cancelReason: reason,
          statusUpdatedAt: nextOrder.statusUpdatedAt,
        },
      }),
    );

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
