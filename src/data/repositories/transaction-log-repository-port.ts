export type TransactionLogEntry = {
  commissionAmount: number;
  commissionRate: number;
  completedAt: string;
  customerId: string;
  estimatedPrice: number;
  logId: string;
  orderId: string;
  partnerId: string;
};

export type TransactionLogRepositoryPort = {
  listLogs: () => Promise<TransactionLogEntry[]>;
  saveLog: (log: TransactionLogEntry) => Promise<void>;
};
