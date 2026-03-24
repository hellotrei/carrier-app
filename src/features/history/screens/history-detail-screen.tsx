import React from 'react';

import type { Order } from '../../../domain/order/order';
import type { TransactionLogEntry } from '../../../data/repositories/transaction-log-repository-port';
import { OrderSummaryBlock } from '../../../ui/patterns/order-summary-block';
import { SectionCard } from '../../../ui/patterns/section-card';
import { AppButton } from '../../../ui/primitives/app-button';
import { AppText } from '../../../ui/primitives/app-text';

type HistoryDetailScreenProps = {
  onBack: () => void;
  order: Order;
  transactionLog?: TransactionLogEntry;
};

export function HistoryDetailScreen({
  onBack,
  order,
  transactionLog,
}: HistoryDetailScreenProps): React.JSX.Element {
  return (
    <SectionCard
      eyebrow="History Detail"
      title={order.destination.label ?? 'Saved order'}
      description="Terminal order detail stays readable offline from local storage."
    >
      <AppText tone="muted">Order ID: {order.orderId}</AppText>
      <AppText tone="muted">Final status: {order.status}</AppText>
      <AppText tone="muted">Requested at: {order.requestedAt ?? '-'}</AppText>
      <AppText tone="muted">Completed at: {order.completedAt ?? '-'}</AppText>
      <AppText tone="muted">
        Terminal reason: {order.cancelReason ?? (order.status === 'Completed' ? 'Completed normally' : '-')}
      </AppText>
      <OrderSummaryBlock
        context="handoff"
        destinationLabel={order.destination.label ?? ''}
        estimatedPrice={order.estimatedPrice}
        pickupLabel={order.pickup.label ?? ''}
      />
      <SectionCard
        eyebrow="Financial Breakdown"
        title="Saved trip totals"
        description="Financial detail stays consistent with the stored terminal order."
      >
        <AppText tone="muted">Estimated price: {order.estimatedPrice}</AppText>
        <AppText tone="muted">
          Commission rate: {transactionLog ? `${transactionLog.commissionRate * 100}%` : '-'}
        </AppText>
        <AppText tone="muted">
          Commission amount: {transactionLog?.commissionAmount ?? '-'}
        </AppText>
      </SectionCard>
      <AppText tone="muted">Rating: {order.finalRating ?? '-'}</AppText>
      <AppText tone="muted">Feedback source: {order.feedbackSource ?? '-'}</AppText>
      <AppText tone="muted">Review: {order.reviewText ?? '-'}</AppText>
      <AppButton label="Back to history" kind="secondary" onPress={onBack} />
    </SectionCard>
  );
}
