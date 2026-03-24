import type { AuditRepositoryPort } from '../../data/repositories/audit-repository-port';
import { nowIso } from '../../core/utils/now';
import type { Result } from '../../core/result/result';
import { buildCompletedOrderFeedback, recordCompletedOrderTransaction } from './record-completed-order';
import { buildAuditEvent } from './build-audit-event';
import {
  isTerminalOrderStatus,
  type Order,
  type OrderStatus,
} from '../../domain/order/order';
import { transitionOrder } from '../../domain/order/transition-order';
import type { OrderRepositoryPort } from '../../data/repositories/order-repository-port';
import type { TransactionLogRepositoryPort } from '../../data/repositories/transaction-log-repository-port';

export type AdvanceOrderStatusError = { code: 'INVALID_TRANSITION' };

export type AdvanceOrderStatusDeps = {
  auditRepository: AuditRepositoryPort;
  orderRepository: OrderRepositoryPort;
  transactionLogRepository: TransactionLogRepositoryPort;
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
    const timestamp = nowIso();
    const transitionedOrder = transitionOrder(order, nextStatus, timestamp);
    const nextOrder =
      nextStatus === 'Completed'
        ? buildCompletedOrderFeedback({
            ...transitionedOrder,
            completedAt: timestamp,
          })
        : transitionedOrder;

    await deps.orderRepository.saveOrder(nextOrder);
    await deps.auditRepository.appendEvent(
      buildAuditEvent({
        actorRole: 'mitra',
        actorUserId: nextOrder.partnerId,
        eventType: `ORDER_${nextOrder.status.toUpperCase()}`,
        orderId: nextOrder.orderId,
        payload: {
          nextStatus: nextOrder.status,
          statusUpdatedAt: nextOrder.statusUpdatedAt,
        },
      }),
    );

    if (nextStatus === 'Completed') {
      await recordCompletedOrderTransaction(
        deps.auditRepository,
        deps.transactionLogRepository,
        nextOrder,
      );
    }

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
