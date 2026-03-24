import type { AuditManifestEntry } from '../../data/repositories/audit-repository-port';

export function exportAuditBundlePreview(
  events: AuditManifestEntry[],
): string {
  return JSON.stringify(
    {
      export_meta: {
        eventCount: events.length,
        exportedAt: new Date().toISOString(),
      },
      manifest: events.map(event => ({
        actorRole: event.actorRole,
        actorUserId: event.actorUserId,
        checksum: event.checksum ?? null,
        createdAt: event.createdAt,
        eventId: event.eventId,
        eventType: event.eventType,
        fileName: event.fileName,
        orderId: event.orderId ?? null,
        payloadJson: event.payloadJson,
      })),
    },
    null,
    2,
  );
}
