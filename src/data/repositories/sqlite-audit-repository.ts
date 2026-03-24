import type { SqlStatementExecutor } from '../db/sqlite/database-port';
import type {
  AuditManifestEntry,
  AuditRepositoryPort,
} from './audit-repository-port';

type AuditManifestRow = {
  actor_role: AuditManifestEntry['actorRole'];
  actor_user_id: string;
  checksum: string | null;
  created_at: string;
  event_id: string;
  event_type: string;
  file_name: string;
  order_id: string | null;
  payload_json: string;
};

function mapRowToAuditEntry(row: AuditManifestRow): AuditManifestEntry {
  return {
    actorRole: row.actor_role,
    actorUserId: row.actor_user_id,
    checksum: row.checksum ?? undefined,
    createdAt: row.created_at,
    eventId: row.event_id,
    eventType: row.event_type,
    fileName: row.file_name,
    orderId: row.order_id ?? undefined,
    payloadJson: row.payload_json,
  };
}

export function createSqliteAuditRepository(
  database: SqlStatementExecutor,
): AuditRepositoryPort {
  return {
    async appendEvent(entry) {
      await database.execute(
        `INSERT INTO audit_manifest (
          event_id,
          event_type,
          order_id,
          actor_user_id,
          actor_role,
          file_name,
          checksum,
          payload_json,
          created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          entry.eventId,
          entry.eventType,
          entry.orderId ?? null,
          entry.actorUserId,
          entry.actorRole,
          entry.fileName,
          entry.checksum ?? null,
          entry.payloadJson,
          entry.createdAt,
        ],
      );
    },
    async listEvents() {
      const rows = await database.queryAll<AuditManifestRow>(
        `SELECT
          event_id,
          event_type,
          order_id,
          actor_user_id,
          actor_role,
          file_name,
          checksum,
          payload_json,
          created_at
        FROM audit_manifest
        ORDER BY created_at DESC`,
      );

      return rows.map(mapRowToAuditEntry);
    },
  };
}
