import { create } from 'zustand';

import type { Order } from '../../domain/order/order';
import type { HistoryFilter } from '../../data/repositories/order-repository-port';
import type { TransactionLogEntry } from '../../data/repositories/transaction-log-repository-port';
import type { AuditManifestEntry } from '../../data/repositories/audit-repository-port';

type HistoryStore = {
  auditEvents: AuditManifestEntry[];
  historyFilter: HistoryFilter;
  historyOrders: Order[];
  selectedHistoryOrderId: string | null;
  setAuditEvents: (events: AuditManifestEntry[]) => void;
  setHistoryFilter: (filter: HistoryFilter) => void;
  setHistoryOrders: (orders: Order[]) => void;
  setSelectedHistoryOrderId: (orderId: string | null) => void;
  setTransactionLogs: (logs: TransactionLogEntry[]) => void;
  transactionLogs: TransactionLogEntry[];
};

export const useHistoryStore = create<HistoryStore>(set => ({
  auditEvents: [],
  historyFilter: 'all',
  historyOrders: [],
  selectedHistoryOrderId: null,
  setAuditEvents: auditEvents => set({ auditEvents }),
  setHistoryFilter: historyFilter => set({ historyFilter }),
  setHistoryOrders: historyOrders => set({ historyOrders }),
  setSelectedHistoryOrderId: selectedHistoryOrderId => set({ selectedHistoryOrderId }),
  setTransactionLogs: transactionLogs => set({ transactionLogs }),
  transactionLogs: [],
}));
