import React from 'react';

import { sanitizeJsonPreview } from '../../../core/errors/sanitize-display-value';
import type { AuditManifestEntry } from '../../../data/repositories/audit-repository-port';
import { SectionCard } from '../../../ui/patterns/section-card';
import { UiStateCard } from '../../../ui/patterns/ui-state-card';
import { AppButton } from '../../../ui/primitives/app-button';
import { AppText } from '../../../ui/primitives/app-text';

type AuditFilter = 'all' | 'feedback' | 'order' | 'transaction';

type AuditScreenProps = {
  events: AuditManifestEntry[];
  onBack: () => void;
  onPreviewExport: (events: AuditManifestEntry[]) => void;
};

function matchesFilter(
  event: AuditManifestEntry,
  filter: AuditFilter,
): boolean {
  if (filter === 'all') {
    return true;
  }

  if (filter === 'feedback') {
    return event.eventType.includes('FEEDBACK');
  }

  if (filter === 'transaction') {
    return event.eventType.includes('TRANSACTION');
  }

  return event.eventType.includes('ORDER');
}

export function AuditScreen({
  events,
  onBack,
  onPreviewExport,
}: AuditScreenProps): React.JSX.Element {
  const [filter, setFilter] = React.useState<AuditFilter>('all');
  const filteredEvents = events.filter(event => matchesFilter(event, filter));
  const orderCount = events.filter(event => matchesFilter(event, 'order')).length;
  const transactionCount = events.filter(
    event => matchesFilter(event, 'transaction'),
  ).length;
  const feedbackCount = events.filter(event => matchesFilter(event, 'feedback')).length;

  return (
    <SectionCard
      eyebrow="Audit"
      title="Local audit manifest"
      description="Each saved event stays indexed locally for operator tracing and later export."
    >
      <AppText tone="muted">All events: {events.length}</AppText>
      <AppText tone="muted">Order events: {orderCount}</AppText>
      <AppText tone="muted">Transaction events: {transactionCount}</AppText>
      <AppText tone="muted">Feedback events: {feedbackCount}</AppText>
      <AppButton
        label="All"
        kind={filter === 'all' ? 'primary' : 'secondary'}
        onPress={() => setFilter('all')}
      />
      <AppButton
        label="Order"
        kind={filter === 'order' ? 'primary' : 'secondary'}
        onPress={() => setFilter('order')}
      />
      <AppButton
        label="Transaction"
        kind={filter === 'transaction' ? 'primary' : 'secondary'}
        onPress={() => setFilter('transaction')}
      />
      <AppButton
        label="Feedback"
        kind={filter === 'feedback' ? 'primary' : 'secondary'}
        onPress={() => setFilter('feedback')}
      />
      {!filteredEvents.length ? (
        <UiStateCard
          title="No audit events yet"
          description="Order, transaction, and feedback events will be indexed here once local activity is recorded."
        />
      ) : null}
      {filteredEvents.map(event => (
        <SectionCard
          key={event.eventId}
          eyebrow={event.eventType}
          title={event.fileName}
          description={event.createdAt}
        >
          <AppText tone="muted">Order ID: {event.orderId ?? '-'}</AppText>
          <AppText tone="muted">Actor role: {event.actorRole}</AppText>
          <AppText tone="muted">Actor user: {event.actorUserId}</AppText>
          <AppText tone="muted">Checksum: {event.checksum ?? '-'}</AppText>
          <AppText tone="muted">
            Payload preview: {sanitizeJsonPreview(event.payloadJson)}
          </AppText>
        </SectionCard>
      ))}
      <AppButton
        label="Preview audit export"
        kind="secondary"
        onPress={() => onPreviewExport(filteredEvents)}
      />
      <AppButton label="Back to history" kind="secondary" onPress={onBack} />
    </SectionCard>
  );
}
