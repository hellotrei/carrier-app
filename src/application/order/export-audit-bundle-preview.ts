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
      JSON.stringify(
        {
          checksum: event.checksum ?? null,
          contentType: 'application/json',
          eventId: event.eventId,
          eventType: event.eventType,
          payload: JSON.parse(event.payloadJson),
        },
        null,
        2,
      ),
    ]),
  );
}

export function buildAuditBundleFiles(
  events: AuditManifestEntry[],
): Record<string, string> {
  const exportedAt = new Date().toISOString();

  return {
    'export_meta.json': JSON.stringify(
      {
        deviceId: PREVIEW_DEVICE_ID,
        eventCount: events.length,
        exportedAt,
        tripVersion: CARRIER_APP_VERSION,
      },
      null,
      2,
    ),
    'manifest.json': JSON.stringify(events.map(buildManifestItem), null, 2),
    ...buildEventFileMap(events),
  };
}

export function exportAuditBundlePreview(
  events: AuditManifestEntry[],
): string {
  const files = buildAuditBundleFiles(events);

  return JSON.stringify(
    {
      files: Object.fromEntries(
        Object.entries(files).map(([path, content]) => {
          try {
            return [path, JSON.parse(content)];
          } catch {
            return [path, content];
          }
        }),
      ),
      format: 'carrieraudit-preview-v2',
    },
    null,
    2,
  );
}
