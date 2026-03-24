import type { SqlStatementExecutor } from '../db/sqlite/database-port';
import type {
  TransactionLogEntry,
  TransactionLogRepositoryPort,
} from './transaction-log-repository-port';

type TransactionLogRow = {
  commission_amount: number;
  commission_rate: number;
  completed_at: string;
  customer_id: string;
  estimated_price: number;
  log_id: string;
  order_id: string;
  partner_id: string;
};

function mapRowToTransactionLog(row: TransactionLogRow): TransactionLogEntry {
  return {
    commissionAmount: row.commission_amount,
    commissionRate: row.commission_rate,
    completedAt: row.completed_at,
    customerId: row.customer_id,
    estimatedPrice: row.estimated_price,
    logId: row.log_id,
    orderId: row.order_id,
    partnerId: row.partner_id,
  };
}

export function createSqliteTransactionLogRepository(
  database: SqlStatementExecutor,
): TransactionLogRepositoryPort {
  return {
    async listLogs() {
      const rows = await database.queryAll<TransactionLogRow>(
        `SELECT
          log_id,
          order_id,
          customer_id,
          partner_id,
          estimated_price,
          commission_rate,
          commission_amount,
          completed_at
        FROM transaction_log
        ORDER BY completed_at DESC`,
      );

      return rows.map(mapRowToTransactionLog);
    },
    async saveLog(log) {
      await database.execute(
        `INSERT INTO transaction_log (
          log_id,
          order_id,
          customer_id,
          partner_id,
          estimated_price,
          commission_rate,
          commission_amount,
          completed_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(log_id) DO UPDATE SET
          estimated_price = excluded.estimated_price,
          commission_rate = excluded.commission_rate,
          commission_amount = excluded.commission_amount,
          completed_at = excluded.completed_at`,
        [
          log.logId,
          log.orderId,
          log.customerId,
          log.partnerId,
          log.estimatedPrice,
          log.commissionRate,
          log.commissionAmount,
          log.completedAt,
        ],
      );
    },
  };
}
