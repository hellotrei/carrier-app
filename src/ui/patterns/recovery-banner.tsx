import React from 'react';

import type { Order } from '../../domain/order/order';
import {
  getRecoveryActiveActorHint,
  getRecoveryResumeHint,
  getRecoveryResumeLabel,
} from '../../features/order/order-status-copy';
import { SectionCard } from './section-card';
import { AppButton } from '../primitives/app-button';
import { AppText } from '../primitives/app-text';

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
      <AppText tone="muted">{getRecoveryResumeHint(order.status)}</AppText>
      <AppText tone="muted">{getRecoveryActiveActorHint(order.status)}</AppText>
      {order.requestedAt ? (
        <AppText tone="muted">Requested at: {order.requestedAt}</AppText>
      ) : null}
      <AppText tone="muted">
        Last status update: {order.statusUpdatedAt}
      </AppText>
      <AppButton label={getRecoveryResumeLabel(order.status)} onPress={onResume} />
    </SectionCard>
  );
}
