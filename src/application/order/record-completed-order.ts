import { createId } from '../../core/utils/create-id';
import type { Order } from '../../domain/order/order';
import type { TransactionLogRepositoryPort } from '../../data/repositories/transaction-log-repository-port';

const DEFAULT_COMPLETED_RATING = 5;
const DEFAULT_COMMISSION_RATE = 0.1;

export function buildCompletedOrderFeedback(order: Order): Order {
  return {
    ...order,
    completedAt: order.completedAt ?? order.statusUpdatedAt,
    feedbackSource: order.feedbackSource ?? 'default_auto',
    finalRating: order.finalRating ?? DEFAULT_COMPLETED_RATING,
    reviewText: order.reviewText?.trim() || undefined,
  };
}

export async function recordCompletedOrderTransaction(
  transactionLogRepository: TransactionLogRepositoryPort,
  order: Order,
): Promise<void> {
  const completedAt = order.completedAt ?? order.statusUpdatedAt;
  const commissionAmount = Number(
    (order.estimatedPrice * DEFAULT_COMMISSION_RATE).toFixed(2),
  );

  await transactionLogRepository.saveLog({
    commissionAmount,
    commissionRate: DEFAULT_COMMISSION_RATE,
    completedAt,
    customerId: order.customerId,
    estimatedPrice: order.estimatedPrice,
    logId: createId('txn'),
    orderId: order.orderId,
    partnerId: order.partnerId,
  });
}
