import React from 'react';

import type { Order } from '../../../domain/order/order';
import { AppButton } from '../../../ui/primitives/app-button';
import { AppText } from '../../../ui/primitives/app-text';
import { SectionCard } from '../../../ui/patterns/section-card';

type HomeMitraScreenProps = {
  onOpenRequest: (() => void) | undefined;
  requestedOrder: Order | undefined;
};

export function HomeMitraScreen({
  onOpenRequest,
  requestedOrder,
}: HomeMitraScreenProps): React.JSX.Element {
  if (requestedOrder) {
    return (
      <SectionCard
        eyebrow="Inbox"
        title="Incoming customer request"
        description="A locally recovered request is waiting for mitra review before it moves into the active trip flow."
      >
        <AppText tone="muted">Order ID: {requestedOrder.orderId}</AppText>
        <AppText tone="muted">Requested at: {requestedOrder.requestedAt ?? requestedOrder.updatedAt}</AppText>
        <AppText tone="muted">
          Route: {requestedOrder.pickup.label ?? 'Pickup'} to {requestedOrder.destination.label ?? 'Destination'}
        </AppText>
        <AppText tone="muted">
          Fare preview: Rp {requestedOrder.estimatedPrice.toLocaleString('id-ID')}
        </AppText>
        {onOpenRequest ? (
          <AppButton label="Open request" onPress={onOpenRequest} />
        ) : null}
      </SectionCard>
    );
  }

  return (
    <SectionCard
      eyebrow="Feature"
      title="Mitra home scaffold"
      description="This slice is ready for readiness gates, online toggle orchestration, and incoming-order flow without duplicating shared UI."
    />
  );
}
