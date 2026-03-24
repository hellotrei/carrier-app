import React from 'react';

import { HomeCustomerScreen } from '../../../features/home-customer/screens/home-customer-screen';
import { HomeMitraScreen } from '../../../features/home-mitra/screens/home-mitra-screen';
import { useAppShellStore } from '../../../state/app-shell/app-shell-store';

type HomeRouteProps = {
  draftError: string | null;
  onClearDraft: () => void;
  onCreateDraft: (params: {
    destinationLabel: string;
    estimatedPrice: string;
    pickupLabel: string;
  }) => Promise<void>;
  onOpenRequestedOrder: () => void;
  onReviewProfile: () => void;
};

export function HomeRoute({
  draftError,
  onClearDraft,
  onCreateDraft,
  onOpenRequestedOrder,
  onReviewProfile,
}: HomeRouteProps): React.JSX.Element | null {
  const activeOrder = useAppShellStore(state => state.activeOrder);
  const activeRole = useAppShellStore(state => state.activeRole);
  const profile = useAppShellStore(state => state.profile);

  if (activeRole === 'customer') {
    return (
      <HomeCustomerScreen
        activeOrderStatus={
          activeOrder && activeOrder.status !== 'Canceled' &&
          activeOrder.status !== 'Completed' &&
          activeOrder.status !== 'Rejected' &&
          activeOrder.status !== 'Expired'
            ? activeOrder.status
            : undefined
        }
        activeOrderSummary={
          activeOrder
            ? {
                destinationLabel: activeOrder.destination.label ?? '',
                estimatedPrice: String(activeOrder.estimatedPrice),
                pickupLabel: activeOrder.pickup.label ?? '',
              }
            : undefined
        }
        initialDraftValues={
          activeOrder?.status === 'Draft'
            ? {
                destinationLabel: activeOrder.destination.label ?? '',
                estimatedPrice: String(activeOrder.estimatedPrice),
                pickupLabel: activeOrder.pickup.label ?? '',
              }
            : undefined
        }
        lastUpdatedHint={
          activeOrder
            ? activeOrder.status === 'Draft'
              ? `Draft last updated: ${activeOrder.updatedAt}.`
              : `Last status update: ${activeOrder.statusUpdatedAt}.`
            : undefined
        }
        onClearDraft={
          activeOrder?.status === 'Draft'
            ? onClearDraft
            : undefined
        }
        onCreateDraft={onCreateDraft}
        submitError={draftError}
      />
    );
  }

  return (
    <HomeMitraScreen
      onOpenRequest={
        activeOrder?.status === 'Requested'
          ? onOpenRequestedOrder
          : undefined
      }
      onReviewProfile={onReviewProfile}
      profile={profile}
      requestedOrder={
        activeOrder?.status === 'Requested' ? activeOrder : undefined
      }
    />
  );
}
