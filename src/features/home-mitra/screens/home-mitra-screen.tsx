import React from 'react';

import type { Order } from '../../../domain/order/order';
import type { UserProfile } from '../../../domain/user/user-profile';
import { isDriverReady } from '../../../domain/user/validate-driver-readiness';
import { AppButton } from '../../../ui/primitives/app-button';
import { AppText } from '../../../ui/primitives/app-text';
import { SectionCard } from '../../../ui/patterns/section-card';

type HomeMitraScreenProps = {
  onOpenRequest: (() => void) | undefined;
  profile: UserProfile | undefined;
  requestedOrder: Order | undefined;
};

export function HomeMitraScreen({
  onOpenRequest,
  profile,
  requestedOrder,
}: HomeMitraScreenProps): React.JSX.Element {
  if (requestedOrder) {
    const mitraReady = profile ? isDriverReady(profile) : false;

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
        <AppText tone="muted">
          Driver readiness: {profile?.driverReadinessStatus ?? 'draft'}
        </AppText>
        {!mitraReady ? (
          <AppText>
            Complete mitra readiness first. Active vehicle and minimum driver setup must be valid before opening this request.
          </AppText>
        ) : null}
        {onOpenRequest && mitraReady ? (
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
