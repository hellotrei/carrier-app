import React from 'react';

import { AppText } from '../primitives/app-text';

type OrderSummaryContext = 'default' | 'handoff' | 'request' | 'draft_review';

type OrderSummaryBlockProps = {
  context?: OrderSummaryContext;
  destinationLabel: string;
  estimatedPrice: number;
  pickupLabel: string;
};

function getPriceLabel(context: OrderSummaryContext): string {
  if (context === 'draft_review') {
    return 'Fare lock preview';
  }

  if (context === 'request') {
    return 'Fare preview';
  }

  return 'Estimated price';
}

export function OrderSummaryBlock({
  context = 'default',
  destinationLabel,
  estimatedPrice,
  pickupLabel,
}: OrderSummaryBlockProps): React.JSX.Element {
  return (
    <>
      <AppText>Pickup: {pickupLabel || 'Pickup'}</AppText>
      <AppText>Destination: {destinationLabel || 'Destination'}</AppText>
      <AppText>
        {getPriceLabel(context)}: Rp {estimatedPrice.toLocaleString('id-ID')}
      </AppText>
    </>
  );
}
