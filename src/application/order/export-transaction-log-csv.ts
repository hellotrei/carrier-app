import type { TransactionLogEntry } from '../../data/repositories/transaction-log-repository-port';

function escapeCsvCell(value: string | number): string {
  const text = String(value);

  if (text.includes(',') || text.includes('"') || text.includes('\n')) {
    return `"${text.replace(/"/g, '""')}"`;
  }

  return text;
}

export function exportTransactionLogCsv(
  logs: TransactionLogEntry[],
): string {
  const header = [
    'log_id',
    'order_id',
    'customer_id',
    'partner_id',
    'estimated_price',
    'commission_rate',
    'commission_amount',
    'completed_at',
  ];

  const rows = logs.map(log => [
    log.logId,
    log.orderId,
    log.customerId,
    log.partnerId,
    log.estimatedPrice,
    log.commissionRate,
    log.commissionAmount,
    log.completedAt,
  ]);

  return [header, ...rows]
    .map(columns => columns.map(escapeCsvCell).join(','))
    .join('\n');
}
