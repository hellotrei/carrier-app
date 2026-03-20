import React from 'react';

import type { Order } from '../../../domain/order/order';
import {
  getRecoveryActiveActorHint,
  getRecoveryResumeHint,
} from '../../order/order-status-copy';
import type { UserProfile } from '../../../domain/user/user-profile';
import { isDriverReady } from '../../../domain/user/validate-driver-readiness';
import { OrderSummaryBlock } from '../../../ui/patterns/order-summary-block';
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
            destinationLabel={requestedOrder.destination.label ?? ''}
            estimatedPrice={requestedOrder.estimatedPrice}
            pickupLabel={requestedOrder.pickup.label ?? ''}
            priceLabel="Fare preview"
          />
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
        {!mitraReady ? (
          <SectionCard
            eyebrow="Guidance"
            title="Finish mitra readiness"
            description="This request stays locked until the minimum mitra setup is complete. Update the mitra profile section in this screen first."
          >
            {readinessGuidance.map(item => (
              <AppText key={item} tone="muted">
                - {item}
              </AppText>
            ))}
            <AppButton
              label="Review mitra profile"
              kind="secondary"
              onPress={onReviewProfile}
            />
          </SectionCard>
        ) : null}
      </>
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
