import type { AuditRepositoryPort } from '../../data/repositories/audit-repository-port';
import { nowIso } from '../../core/utils/now';
import type { Result } from '../../core/result/result';
import type { OrderRepositoryPort } from '../../data/repositories/order-repository-port';
import type { Order } from '../../domain/order/order';
import { buildAuditEvent } from './build-audit-event';

export type SavePostTripFeedbackDeps = {
  auditRepository: AuditRepositoryPort;
  orderRepository: OrderRepositoryPort;
};

export type SavePostTripFeedbackError =
  | { code: 'ORDER_NOT_COMPLETED' }
  | { code: 'INVALID_RATING' };

export async function savePostTripFeedback(
  deps: SavePostTripFeedbackDeps,
  order: Order,
  params: {
    manualRating?: number;
    reviewText?: string;
  },
): Promise<Result<Order, SavePostTripFeedbackError>> {
  if (order.status !== 'Completed') {
    return {
      ok: false,
      error: { code: 'ORDER_NOT_COMPLETED' },
    };
  }

  if (
    params.manualRating !== undefined &&
    (params.manualRating < 1 || params.manualRating > 5)
  ) {
    return {
      ok: false,
      error: { code: 'INVALID_RATING' },
    };
  }

  const nextOrder: Order = {
    ...order,
    feedbackSource: params.manualRating ? 'manual' : order.feedbackSource ?? 'default_auto',
    finalRating: params.manualRating ?? order.finalRating ?? 5,
    reviewText: params.reviewText?.trim() || undefined,
    updatedAt: nowIso(),
  };

  await deps.orderRepository.saveOrder(nextOrder);
  await deps.auditRepository.appendEvent(
    buildAuditEvent({
      actorRole: 'customer',
      actorUserId: nextOrder.customerId,
      eventType: 'POST_TRIP_FEEDBACK_SAVED',
      orderId: nextOrder.orderId,
      payload: {
        feedbackSource: nextOrder.feedbackSource,
        finalRating: nextOrder.finalRating,
        hasReviewText: Boolean(nextOrder.reviewText),
      },
    }),
  );

  return {
    ok: true,
    value: nextOrder,
  };
}
