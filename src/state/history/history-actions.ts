import type { AuditRepositoryPort } from '../../data/repositories/audit-repository-port';
import type { HistoryFilter, OrderRepositoryPort } from '../../data/repositories/order-repository-port';
import type { TransactionLogRepositoryPort } from '../../data/repositories/transaction-log-repository-port';

export type LoadHistorySnapshotDeps = {
  auditRepository: AuditRepositoryPort;
  orderRepository: OrderRepositoryPort;
  transactionLogRepository: TransactionLogRepositoryPort;
};

export async function loadHistorySnapshot(
  deps: LoadHistorySnapshotDeps,
  filter: HistoryFilter,
) {
  const [historyOrders, transactionLogs, auditEvents] = await Promise.all([
    deps.orderRepository.listHistory(filter),
    deps.transactionLogRepository.listLogs(),
    deps.auditRepository.listEvents(),
  ]);

  return {
    auditEvents,
    historyOrders,
    transactionLogs,
  };
}
