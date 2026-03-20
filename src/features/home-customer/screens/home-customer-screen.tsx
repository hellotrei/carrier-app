import React, { useEffect, useState } from 'react';

import type { OrderStatus } from '../../../domain/order/order';
import { getCustomerHomeStatusDescription } from '../../order/order-status-copy';
import { AppButton } from '../../../ui/primitives/app-button';
import { AppInput } from '../../../ui/primitives/app-input';
import { AppText } from '../../../ui/primitives/app-text';
import { SectionCard } from '../../../ui/patterns/section-card';

type HomeCustomerScreenProps = {
  activeOrderStatus:
    | Extract<OrderStatus, 'Draft' | 'Requested' | 'Accepted' | 'OnTheWay' | 'OnTrip'>
    | undefined;
  activeOrderSummary: {
    destinationLabel: string;
    estimatedPrice: string;
    pickupLabel: string;
  } | undefined;
  initialDraftValues: {
    destinationLabel: string;
    estimatedPrice: string;
    pickupLabel: string;
  } | undefined;
  lastUpdatedHint: string | undefined;
  onCreateDraft: (params: {
    destinationLabel: string;
    estimatedPrice: string;
    pickupLabel: string;
  }) => Promise<void>;
  onClearDraft: (() => void) | undefined;
  submitError?: string | null;
};

export function HomeCustomerScreen({
  activeOrderStatus,
  activeOrderSummary,
  initialDraftValues,
  lastUpdatedHint,
  submitError,
  onCreateDraft,
  onClearDraft,
}: HomeCustomerScreenProps): React.JSX.Element {
  const [destinationLabel, setDestinationLabel] = useState('');
  const [estimatedPrice, setEstimatedPrice] = useState('');
  const [pickupLabel, setPickupLabel] = useState('');

  useEffect(() => {
    setDestinationLabel(initialDraftValues?.destinationLabel ?? '');
    setEstimatedPrice(initialDraftValues?.estimatedPrice ?? '');
    setPickupLabel(initialDraftValues?.pickupLabel ?? '');
  }, [initialDraftValues]);

  if (activeOrderStatus && activeOrderStatus !== 'Draft') {
    return (
      <SectionCard
        eyebrow="Feature"
        title="Customer home scaffold"
        description={getCustomerHomeStatusDescription(activeOrderStatus)}
      >
        {lastUpdatedHint ? <AppText tone="muted">{lastUpdatedHint}</AppText> : null}
        {activeOrderSummary ? (
          <>
            <AppText tone="muted">
              Pickup: {activeOrderSummary.pickupLabel || 'Pickup'}
            </AppText>
            <AppText tone="muted">
              Destination: {activeOrderSummary.destinationLabel || 'Destination'}
            </AppText>
            <AppText tone="muted">
              Estimated price: Rp {Number(activeOrderSummary.estimatedPrice).toLocaleString('id-ID')}
            </AppText>
          </>
        ) : null}
      </SectionCard>
    );
  }

  return (
    <SectionCard
      eyebrow="Feature"
      title="Customer home scaffold"
      description="This slice is ready for discovery, booking draft, and empty-state work without leaking storage or relay concerns into the screen."
    >
      {activeOrderStatus === 'Draft' && lastUpdatedHint ? (
        <AppText tone="muted">{lastUpdatedHint}</AppText>
      ) : null}
      <AppInput
        label="Pickup"
        onChangeText={setPickupLabel}
        placeholder="Pickup location"
        value={pickupLabel}
      />
      <AppInput
        label="Destination"
        onChangeText={setDestinationLabel}
        placeholder="Destination location"
        value={destinationLabel}
      />
      <AppInput
        keyboardType="numeric"
        label="Estimated price"
        onChangeText={setEstimatedPrice}
        placeholder="18000"
        value={estimatedPrice}
      />
      {submitError ? <AppText>{submitError}</AppText> : null}
      <AppButton
        label={activeOrderStatus === 'Draft' ? 'Update draft' : 'Save draft'}
        onPress={() => {
          void onCreateDraft({
            destinationLabel,
            estimatedPrice,
            pickupLabel,
          });
        }}
      />
      {activeOrderStatus === 'Draft' && onClearDraft ? (
        <AppButton
          label="Clear draft"
          kind="secondary"
          onPress={onClearDraft}
        />
      ) : null}
    </SectionCard>
  );
}
