import React from 'react';

import type { Order } from '../../../domain/order/order';
import {
  getRecoveryActiveActorHint,
  getRecoveryResumeHint,
} from '../../order/order-status-copy';
import type { UserProfile } from '../../../domain/user/user-profile';
import { isDriverReady } from '../../../domain/user/validate-driver-readiness';
import { OrderSummaryBlock } from '../../../ui/patterns/order-summary-block';
import { UiStateCard } from '../../../ui/patterns/ui-state-card';
import { AppButton } from '../../../ui/primitives/app-button';
import { AppText } from '../../../ui/primitives/app-text';
import { SectionCard } from '../../../ui/patterns/section-card';

type HomeMitraScreenProps = {
  onOpenRequest: (() => void) | undefined;
  onReviewProfile: () => void;
  profile: UserProfile | undefined;
  requestedOrder: Order | undefined;
};

function getReadinessGuidance(profile: UserProfile | undefined): string[] {
  if (!profile) {
    return ['Create a mitra profile before reviewing incoming requests.'];
  }

  const activeVehicle = profile.vehicles?.find(vehicle => vehicle.isActiveForBooking);
  const guidance: string[] = [];

  if (!activeVehicle) {
    guidance.push('Add one active vehicle for booking.');
  }

  if (activeVehicle && !activeVehicle.plateNumber?.trim()) {
    guidance.push('Complete the vehicle plate number.');
  }

  if (activeVehicle?.vehicleType === 'motor' && !profile.hasSpareHelmet) {
    guidance.push('Mark spare helmet as ready for motor bookings.');
  }

  if (!guidance.length && profile.driverReadinessStatus !== 'minimum_valid') {
    guidance.push('Review the mitra profile and save it again to refresh readiness.');
  }

  return guidance;
}

export function HomeMitraScreen({
  onOpenRequest,
  onReviewProfile,
  profile,
  requestedOrder,
}: HomeMitraScreenProps): React.JSX.Element {
  if (requestedOrder) {
    const mitraReady = profile ? isDriverReady(profile) : false;
    const readinessGuidance = getReadinessGuidance(profile);

    return (
      <>
        <SectionCard
          eyebrow="Inbox"
          title="Incoming customer request"
          description={getRecoveryResumeHint(requestedOrder.status)}
        >
          <AppText tone="muted">Order ID: {requestedOrder.orderId}</AppText>
          <AppText tone="muted">
            {getRecoveryActiveActorHint(requestedOrder.status)}
          </AppText>
          <AppText tone="muted">Requested at: {requestedOrder.requestedAt ?? requestedOrder.updatedAt}</AppText>
          <OrderSummaryBlock
            context="request"
            destinationLabel={requestedOrder.destination.label ?? ''}
            estimatedPrice={requestedOrder.estimatedPrice}
            pickupLabel={requestedOrder.pickup.label ?? ''}
          />
          <AppText tone="muted">
            Driver readiness: {profile?.driverReadinessStatus ?? 'draft'}
          </AppText>
          {!mitraReady ? (
            <UiStateCard
              eyebrow="Action Needed"
              title="Mitra readiness is still blocked"
              description="Complete the minimum driver setup first. An active vehicle and valid readiness inputs are required before this request can be opened."
              tone="warning"
            />
          ) : null}
          {onOpenRequest && mitraReady ? (
            <AppButton label="Open request" onPress={onOpenRequest} />
          ) : null}
        </SectionCard>
        {!mitraReady ? (
          <UiStateCard
            eyebrow="Guidance"
            title="Finish mitra readiness"
            description={`This request stays locked until the minimum mitra setup is complete.${readinessGuidance.length ? ` ${readinessGuidance.join(' ')}` : ''}`}
            secondaryActionLabel="Review mitra profile"
            onSecondaryAction={onReviewProfile}
            tone="warning"
          />
        ) : null}
      </>
    );
  }

  return (
    <UiStateCard
      eyebrow="Inbox"
      title="No incoming request yet"
      description="Mitra home is ready for request review, but no saved request is waiting in the local inbox right now."
    />
  );
}
