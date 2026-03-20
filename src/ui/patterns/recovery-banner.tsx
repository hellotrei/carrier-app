import React from 'react';

import type { Order } from '../../domain/order/order';
import { SectionCard } from './section-card';
import { AppButton } from '../primitives/app-button';
import { AppText } from '../primitives/app-text';

type RecoveryBannerProps = {
  onResume: () => void;
  order: Order;
};

function getResumeHint(order: Order): string {
  if (order.status === 'Draft') {
    return 'Resume returns you to the saved draft flow with the current local booking values.';
  }

  if (order.status === 'Requested') {
    return 'Resume returns you to the active handoff flow so the next actor can continue from the saved request.';
  }

  if (order.status === 'Accepted' || order.status === 'OnTheWay') {
    return 'Resume returns you to the active pickup flow with the latest saved booking summary.';
  }

  return 'Resume returns you to the active trip flow with the latest saved recovery state.';
}

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
      <AppText tone="muted">{getResumeHint(order)}</AppText>
      <AppButton label="Resume order" onPress={onResume} />
    </SectionCard>
  );
}
