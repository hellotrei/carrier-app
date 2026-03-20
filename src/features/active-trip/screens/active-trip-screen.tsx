import React from 'react';

import type {
  Order,
  OrderCancelReason,
  OrderStatus,
} from '../../../domain/order/order';
import { SectionCard } from '../../../ui/patterns/section-card';
import { AppButton } from '../../../ui/primitives/app-button';
import { AppText } from '../../../ui/primitives/app-text';

type ActiveTripScreenProps = {
  onAdvance: (nextStatus: OrderStatus) => void;
  onBack: () => void;
  onCancel: (reason: OrderCancelReason) => void;
  order: Order;
};

function getNextStatus(status: OrderStatus): OrderStatus | null {
  switch (status) {
    case 'Draft':
      return 'Requested';
    case 'Requested':
      return 'Accepted';
    case 'Accepted':
      return 'OnTheWay';
    case 'OnTheWay':
      return 'OnTrip';
    case 'OnTrip':
      return 'Completed';
    default:
      return null;
  }
}

export function ActiveTripScreen({
  onAdvance,
  onBack,
  onCancel,
  order,
}: ActiveTripScreenProps): React.JSX.Element {
  const nextStatus = getNextStatus(order.status);

  return (
    <SectionCard
      eyebrow="Active Trip"
      title="Recovered local order"
      description="This screen is the minimal recovery target for non-terminal orders restored from local persistence."
    >
      <AppText tone="muted">Order ID: {order.orderId}</AppText>
      <AppText tone="muted">Status: {order.status}</AppText>
      <AppText tone="muted">
        Cancel reason: {order.cancelReason ?? 'Not canceled'}
      </AppText>
      <AppText tone="muted">Rider: {order.riderDeclaredName}</AppText>
      <AppText tone="muted">
        Route: {order.pickup.label ?? 'Pickup'} to {order.destination.label ?? 'Destination'}
      </AppText>
      <AppText tone="muted">
        Estimated price: Rp {order.estimatedPrice.toLocaleString('id-ID')}
      </AppText>
      {nextStatus ? (
        <AppButton
          label={`Advance to ${nextStatus}`}
          onPress={() => onAdvance(nextStatus)}
        />
      ) : null}
      <AppButton
        label="Cancel: no show"
        kind="secondary"
        onPress={() => onCancel('no_show')}
      />
      <AppButton
        label="Cancel: identity mismatch"
        kind="secondary"
        onPress={() => onCancel('identity_mismatch')}
      />
      <AppButton
        label="Cancel: unsafe"
        kind="secondary"
        onPress={() => onCancel('unsafe_or_suspicious')}
      />
      <AppButton label="Back to shell" kind="secondary" onPress={onBack} />
    </SectionCard>
  );
}
