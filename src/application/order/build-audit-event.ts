import type { AppRole } from '../../core/types/app-role';
import { createId } from '../../core/utils/create-id';
import { hashString } from '../../core/utils/hash-string';
import { nowIso } from '../../core/utils/now';
import type { AuditManifestEntry } from '../../data/repositories/audit-repository-port';

export function buildAuditEvent(params: {
  actorRole: AppRole;
  actorUserId: string;
  eventType: string;
  orderId?: string;
  payload: Record<string, unknown>;
}): AuditManifestEntry {
  const createdAt = nowIso();
  const payloadJson = JSON.stringify(params.payload);

  return {
    actorRole: params.actorRole,
    actorUserId: params.actorUserId,
    checksum: hashString(payloadJson),
    createdAt,
    eventId: createId('audit'),
    eventType: params.eventType,
    fileName: `${params.eventType.toLowerCase()}-${createdAt}.json`,
    orderId: params.orderId,
    payloadJson,
  };
}
