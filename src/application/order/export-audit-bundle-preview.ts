import type { AuditManifestEntry } from '../../data/repositories/audit-repository-port';

const CARRIER_APP_VERSION = '0.0.1';
const PREVIEW_DEVICE_ID = 'local-device';

function buildManifestItem(event: AuditManifestEntry) {
  return {
    actorRole: event.actorRole,
    actorUserId: event.actorUserId,
    checksum: event.checksum ?? null,
    createdAt: event.createdAt,
    eventId: event.eventId,
    eventType: event.eventType,
    fileName: event.fileName,
    orderId: event.orderId ?? null,
  };
}

function buildEventFileMap(events: AuditManifestEntry[]) {
  return Object.fromEntries(
    events.map(event => [
      `events/${event.fileName}`,
      {
        checksum: event.checksum ?? null,
        contentType: 'application/json',
        eventId: event.eventId,
        eventType: event.eventType,
        payload: JSON.parse(event.payloadJson),
      },
    ]),
  );
}

export function exportAuditBundlePreview(
  events: AuditManifestEntry[],
): string {
  const exportedAt = new Date().toISOString();

  return JSON.stringify(
    {
      files: {
        'export_meta.json': {
          deviceId: PREVIEW_DEVICE_ID,
          eventCount: events.length,
          exportedAt,
          tripVersion: CARRIER_APP_VERSION,
        },
        'manifest.json': events.map(buildManifestItem),
        ...buildEventFileMap(events),
      },
      format: 'carrieraudit-preview-v1',
    },
    null,
    2,
  );
}
