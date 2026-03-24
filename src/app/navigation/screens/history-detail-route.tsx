import React from 'react';

import type { Order } from '../../../domain/order/order';
import { HistoryDetailScreen } from '../../../features/history/screens/history-detail-screen';
import {
  getSelectedHistoryOrder,
  getSelectedHistoryTransactionLog,
} from '../../../state/history/history-selectors';
import { useHistoryStore } from '../../../state/history/history-store';
import { UiStateCard } from '../../../ui/patterns/ui-state-card';

type HistoryDetailRouteProps = {
  onBack: () => void;
  onOpenFeedback: (order: Order) => void;
  selectedCompletedOrder: Order | null;
};

export function HistoryDetailRoute({
  onBack,
  onOpenFeedback,
  selectedCompletedOrder,
}: HistoryDetailRouteProps): React.JSX.Element {
  const historyOrders = useHistoryStore(state => state.historyOrders);
  const selectedHistoryOrderId = useHistoryStore(
    state => state.selectedHistoryOrderId,
  );
  const transactionLogs = useHistoryStore(state => state.transactionLogs);
  const setSelectedHistoryOrderId = useHistoryStore(
    state => state.setSelectedHistoryOrderId,
  );

  const selectedHistoryOrder = getSelectedHistoryOrder({
    historyOrders,
    selectedCompletedOrder,
    selectedHistoryOrderId,
  });
  const selectedHistoryTransactionLog = getSelectedHistoryTransactionLog({
    selectedHistoryOrderId,
    transactionLogs,
  });

  if (!selectedHistoryOrder) {
    return (
      <UiStateCard
        eyebrow="Recovery"
        title="Saved order detail is no longer available"
        description="The selected terminal order could not be restored from the current history view. Return to history and reopen the order from the latest saved list."
        secondaryActionLabel="Back to history"
        onSecondaryAction={onBack}
        tone="warning"
      />
    );
  }

  return (
    <HistoryDetailScreen
      onBack={onBack}
      onOpenFeedback={
        selectedHistoryOrder.status === 'Completed'
          ? () => {
              setSelectedHistoryOrderId(selectedHistoryOrder.orderId);
              onOpenFeedback(selectedHistoryOrder);
            }
          : undefined
      }
      order={selectedHistoryOrder}
      transactionLog={selectedHistoryTransactionLog}
    />
  );
}
