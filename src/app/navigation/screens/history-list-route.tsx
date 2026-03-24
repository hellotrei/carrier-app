import React from 'react';

import { bootstrapDeps } from '../../config/bootstrap-deps';
import { HistoryScreen } from '../../../features/history/screens/history-screen';
import { prepareTransactionCsvPreview } from '../../../state/export/export-actions';
import { loadHistorySnapshot } from '../../../state/history/history-actions';
import { useHistoryStore } from '../../../state/history/history-store';

type HistoryListRouteProps = {
  onBack: () => void;
  onOpenAudit: () => void;
  onOpenOrder: (orderId: string) => void;
  onOpenTransactionCsv: () => void;
};

export function HistoryListRoute({
  onBack,
  onOpenAudit,
  onOpenOrder,
  onOpenTransactionCsv,
}: HistoryListRouteProps): React.JSX.Element {
  const historyFilter = useHistoryStore(state => state.historyFilter);
  const historyOrders = useHistoryStore(state => state.historyOrders);
  const transactionLogs = useHistoryStore(state => state.transactionLogs);
  const setAuditEvents = useHistoryStore(state => state.setAuditEvents);
  const setHistoryFilter = useHistoryStore(state => state.setHistoryFilter);
  const setHistoryOrders = useHistoryStore(state => state.setHistoryOrders);
  const setSelectedHistoryOrderId = useHistoryStore(
    state => state.setSelectedHistoryOrderId,
  );
  const setTransactionLogs = useHistoryStore(state => state.setTransactionLogs);

  const refreshHistory = React.useCallback(async (filter: typeof historyFilter) => {
    const { historyOrders, transactionLogs, auditEvents } =
      await loadHistorySnapshot(bootstrapDeps, filter);

    setHistoryOrders(historyOrders);
    setTransactionLogs(transactionLogs);
    setAuditEvents(auditEvents);
  }, [setAuditEvents, setHistoryOrders, setTransactionLogs]);

  React.useEffect(() => {
    void refreshHistory(historyFilter);
  }, [historyFilter, refreshHistory]);

  return (
    <HistoryScreen
      filter={historyFilter}
      onBack={onBack}
      onChangeFilter={nextFilter => {
        setHistoryFilter(nextFilter);
      }}
      onOpenAudit={onOpenAudit}
      onOpenOrder={orderId => {
        setSelectedHistoryOrderId(orderId);
        onOpenOrder(orderId);
      }}
      onOpenTransactionCsv={() => {
        prepareTransactionCsvPreview(transactionLogs);
        onOpenTransactionCsv();
      }}
      orders={historyOrders}
      transactionLogs={transactionLogs}
    />
  );
}
