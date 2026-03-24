import type { AppRole } from '../../core/types/app-role';

export type AuditManifestEntry = {
  actorRole: AppRole;
  actorUserId: string;
  checksum?: string;
  createdAt: string;
  eventId: string;
  eventType: string;
  fileName: string;
  orderId?: string;
  payloadJson: string;
};

export type AuditRepositoryPort = {
  appendEvent: (entry: AuditManifestEntry) => Promise<void>;
  listEvents: () => Promise<AuditManifestEntry[]>;
};
