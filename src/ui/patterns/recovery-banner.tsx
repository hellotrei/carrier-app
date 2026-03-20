import React from 'react';

import type { Order } from '../../domain/order/order';
import { SectionCard } from './section-card';
import { AppButton } from '../primitives/app-button';

type RecoveryBannerProps = {
  onResume: () => void;
  order: Order;
};

export function RecoveryBanner({
  onResume,
  order,
}: RecoveryBannerProps): React.JSX.Element {
  return (
    <SectionCard
      eyebrow="Recovery"
      title="Active order found"
      description={`Order ${order.status} is stored locally and should be resumed before starting a new flow.`}
    >
      <AppButton label="Resume order" onPress={onResume} />
    </SectionCard>
  );
}
