import React from 'react';

import type { OrderCancelReason, OrderStatus } from '../../../domain/order/order';
import { ActiveTripScreen } from '../../../features/active-trip/screens/active-trip-screen';
import { useAppShellStore } from '../../../state/app-shell/app-shell-store';
import { UiStateCard } from '../../../ui/patterns/ui-state-card';

type ActiveTripRouteProps = {
  onAdvance: (nextStatus: OrderStatus) => void;
  onBack: () => void;
  onCancel: (reason: OrderCancelReason) => void;
};

export function ActiveTripRoute({
  onAdvance,
  onBack,
  onCancel,
}: ActiveTripRouteProps): React.JSX.Element {
  const activeOrder = useAppShellStore(state => state.activeOrder);
  const activeRole = useAppShellStore(state => state.activeRole);
  const profile = useAppShellStore(state => state.profile);

  if (!profile || !activeOrder) {
    return (
      <UiStateCard
        eyebrow="Recovery"
        title="Active trip context is no longer available"
        description="The shell could not restore the active trip from the current local state. Return to home and reopen the latest recoverable order."
        secondaryActionLabel="Back to home"
        onSecondaryAction={onBack}
        tone="warning"
      />
    );
  }

  return (
    <ActiveTripScreen
      activeRole={activeRole}
      onAdvance={onAdvance}
      onBack={onBack}
      onCancel={onCancel}
      order={activeOrder}
    />
  );
}
