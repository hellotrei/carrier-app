import React from 'react';

import type { Order } from '../../../domain/order/order';
import { PostTripFeedbackScreen } from '../../../features/feedback/screens/post-trip-feedback-screen';
import {
  getSelectedFeedbackOrder,
  getSelectedHistoryOrder,
} from '../../../state/history/history-selectors';
import { useHistoryStore } from '../../../state/history/history-store';
import { UiStateCard } from '../../../ui/patterns/ui-state-card';

type PostTripFeedbackRouteProps = {
  onBack: () => void;
  onSubmit: (params: { manualRating?: number; reviewText?: string }) => Promise<void>;
  selectedCompletedOrder: Order | null;
};

export function PostTripFeedbackRoute({
  onBack,
  onSubmit,
  selectedCompletedOrder,
}: PostTripFeedbackRouteProps): React.JSX.Element {
  const historyOrders = useHistoryStore(state => state.historyOrders);
  const selectedHistoryOrderId = useHistoryStore(
    state => state.selectedHistoryOrderId,
  );
  const setSelectedHistoryOrderId = useHistoryStore(
    state => state.setSelectedHistoryOrderId,
  );

  const selectedHistoryOrder = getSelectedHistoryOrder({
    historyOrders,
    selectedCompletedOrder,
    selectedHistoryOrderId,
  });
  const selectedFeedbackOrder = getSelectedFeedbackOrder({
    selectedCompletedOrder,
    selectedHistoryOrder,
  });

  if (!selectedFeedbackOrder) {
    return (
      <UiStateCard
        eyebrow="Recovery"
        title="Saved feedback target is no longer available"
        description="The shell kept history intact, but this completed trip is no longer selected. Return to history and reopen the saved trip detail."
        secondaryActionLabel="Back to history"
        onSecondaryAction={() => {
          setSelectedHistoryOrderId(null);
          onBack();
        }}
        tone="warning"
      />
    );
  }

  return (
    <PostTripFeedbackScreen
      onSkip={() => {
        setSelectedHistoryOrderId(selectedFeedbackOrder.orderId);
        onBack();
      }}
      onSubmit={onSubmit}
      order={selectedFeedbackOrder}
    />
  );
}
