import React, { useState } from 'react';

import type { OrderStatus } from '../../../domain/order/order';
import { AppButton } from '../../../ui/primitives/app-button';
import { AppInput } from '../../../ui/primitives/app-input';
import { AppText } from '../../../ui/primitives/app-text';
import { SectionCard } from '../../../ui/patterns/section-card';

type HomeCustomerScreenProps = {
  activeOrderStatus:
    | Extract<OrderStatus, 'Draft' | 'Requested' | 'Accepted' | 'OnTheWay' | 'OnTrip'>
    | undefined;
  onCreateDraft: (params: {
    destinationLabel: string;
    estimatedPrice: string;
    pickupLabel: string;
  }) => Promise<void>;
  submitError?: string | null;
};

export function HomeCustomerScreen({
  activeOrderStatus,
  submitError,
  onCreateDraft,
}: HomeCustomerScreenProps): React.JSX.Element {
  const [destinationLabel, setDestinationLabel] = useState('');
  const [estimatedPrice, setEstimatedPrice] = useState('');
  const [pickupLabel, setPickupLabel] = useState('');

  if (activeOrderStatus && activeOrderStatus !== 'Draft') {
    return (
      <SectionCard
        eyebrow="Feature"
        title="Customer home scaffold"
        description={`Order ${activeOrderStatus} is already active. Resume that flow before starting a new booking.`}
      />
    );
  }

  return (
    <SectionCard
      eyebrow="Feature"
      title="Customer home scaffold"
      description="This slice is ready for discovery, booking draft, and empty-state work without leaking storage or relay concerns into the screen."
    >
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
    </SectionCard>
  );
}
