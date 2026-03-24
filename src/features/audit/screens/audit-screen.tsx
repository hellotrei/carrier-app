import React from 'react';

import type { AuditManifestEntry } from '../../../data/repositories/audit-repository-port';
import { SectionCard } from '../../../ui/patterns/section-card';
import { AppButton } from '../../../ui/primitives/app-button';
import { AppText } from '../../../ui/primitives/app-text';

type AuditScreenProps = {
  events: AuditManifestEntry[];
  onBack: () => void;
};

export function AuditScreen({
  events,
  onBack,
}: AuditScreenProps): React.JSX.Element {
  return (
    <SectionCard
      eyebrow="Audit"
      title="Local audit manifest"
      description="Each saved event stays indexed locally for operator tracing and later export."
    >
      {!events.length ? (
        <AppText tone="muted">No audit events recorded yet.</AppText>
      ) : null}
      {events.map(event => (
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
          <AppText tone="muted">Payload: {event.payloadJson}</AppText>
        </SectionCard>
      ))}
      <AppButton label="Back to history" kind="secondary" onPress={onBack} />
    </SectionCard>
  );
}
