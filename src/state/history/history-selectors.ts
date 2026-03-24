import type { Order } from '../../domain/order/order';
import type { TransactionLogEntry } from '../../data/repositories/transaction-log-repository-port';

export function getSelectedHistoryOrder(params: {
  historyOrders: Order[];
  selectedCompletedOrder: Order | null;
  selectedHistoryOrderId: string | null;
}): Order | null {
  const { historyOrders, selectedCompletedOrder, selectedHistoryOrderId } = params;

  return historyOrders.find(order => order.orderId === selectedHistoryOrderId) ??
    (selectedCompletedOrder &&
    selectedCompletedOrder.orderId === selectedHistoryOrderId
      ? selectedCompletedOrder
      : null);
}

export function getSelectedFeedbackOrder(params: {
  selectedCompletedOrder: Order | null;
  selectedHistoryOrder: Order | null;
}): Order | null {
  const { selectedCompletedOrder, selectedHistoryOrder } = params;

  if (selectedCompletedOrder?.status === 'Completed') {
    return selectedCompletedOrder;
  }

  return selectedHistoryOrder?.status === 'Completed'
    ? selectedHistoryOrder
    : null;
}

export function getSelectedHistoryTransactionLog(params: {
  selectedHistoryOrderId: string | null;
  transactionLogs: TransactionLogEntry[];
}): TransactionLogEntry | undefined {
  const { selectedHistoryOrderId, transactionLogs } = params;

  return transactionLogs.find(log => log.orderId === selectedHistoryOrderId);
}
