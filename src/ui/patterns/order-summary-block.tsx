import React from 'react';

import { AppText } from '../primitives/app-text';

type OrderSummaryBlockProps = {
  destinationLabel: string;
  estimatedPrice: number;
  pickupLabel: string;
  priceLabel?: string;
};

export function OrderSummaryBlock({
  destinationLabel,
  estimatedPrice,
  pickupLabel,
  priceLabel = 'Estimated price',
}: OrderSummaryBlockProps): React.JSX.Element {
  return (
    <>
      <AppText>Pickup: {pickupLabel || 'Pickup'}</AppText>
      <AppText>Destination: {destinationLabel || 'Destination'}</AppText>
      <AppText>
        {priceLabel}: Rp {estimatedPrice.toLocaleString('id-ID')}
      </AppText>
    </>
  );
}
