import React from 'react';

import type { Order } from '../../../domain/order/order';
import type { HistoryFilter } from '../../../data/repositories/order-repository-port';
import type { TransactionLogEntry } from '../../../data/repositories/transaction-log-repository-port';
import { SectionCard } from '../../../ui/patterns/section-card';
import { AppButton } from '../../../ui/primitives/app-button';
import { AppText } from '../../../ui/primitives/app-text';

type HistoryScreenProps = {
  filter: HistoryFilter;
  onBack: () => void;
  onChangeFilter: (filter: HistoryFilter) => void;
  onOpenOrder: (orderId: Order['orderId']) => void;
  orders: Order[];
  transactionLogs: TransactionLogEntry[];
};

export function HistoryScreen({
  filter,
  onBack,
  onChangeFilter,
  onOpenOrder,
  orders,
  transactionLogs,
}: HistoryScreenProps): React.JSX.Element {
  return (
    <>
      <SectionCard
        eyebrow="History"
        title="Trip history"
        description="Terminal orders stay available locally for tracing, review, and recovery context."
      >
        <AppText tone="muted">Filter: {filter}</AppText>
        <AppButton label="All" kind={filter === 'all' ? 'primary' : 'secondary'} onPress={() => onChangeFilter('all')} />
        <AppButton
          label="Completed"
          kind={filter === 'completed' ? 'primary' : 'secondary'}
          onPress={() => onChangeFilter('completed')}
        />
        <AppButton
          label="Canceled"
          kind={filter === 'canceled' ? 'primary' : 'secondary'}
          onPress={() => onChangeFilter('canceled')}
        />
        {!orders.length ? (
          <AppText tone="muted">No terminal orders are saved yet.</AppText>
        ) : null}
        {orders.map(order => (
          <SectionCard
            key={order.orderId}
            eyebrow={order.status}
            title={order.destination.label ?? 'Saved trip'}
            description={`Updated ${order.updatedAt}`}
          >
            <AppText tone="muted">Pickup: {order.pickup.label ?? '-'}</AppText>
            <AppText tone="muted">Price: {order.estimatedPrice}</AppText>
            <AppButton
              label="Open detail"
              kind="secondary"
              onPress={() => onOpenOrder(order.orderId)}
            />
          </SectionCard>
        ))}
      </SectionCard>

      <SectionCard
        eyebrow="Transaction Log"
        title="Recorded completed trips"
        description="Each completed trip writes one local revenue log entry."
      >
        {!transactionLogs.length ? (
          <AppText tone="muted">No transaction logs recorded yet.</AppText>
        ) : null}
        {transactionLogs.map(log => (
          <AppText key={log.logId} tone="muted">
            {log.completedAt} · {log.orderId} · est. {log.estimatedPrice} · commission {log.commissionAmount}
          </AppText>
        ))}
        <AppButton label="Back to shell" kind="secondary" onPress={onBack} />
      </SectionCard>
    </>
  );
}
