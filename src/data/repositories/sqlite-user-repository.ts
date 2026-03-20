import { asUserId } from '../../core/types/ids';
import type { AppRole } from '../../core/types/app-role';
import type { UserProfile } from '../../domain/user/user-profile';
import type { SqlStatementExecutor } from '../db/sqlite/database-port';
import type { UserRepositoryPort } from './user-repository-port';

type UserProfileRow = {
  active_roles: string;
  created_at: string;
  current_role: AppRole;
  device_auth_enabled: number;
  display_name: string;
  identity_status: UserProfile['identityStatus'];
  phone_hash: string | null;
  phone_masked: string | null;
  profile_validated_at: string | null;
  updated_at: string;
  user_id: string;
};

function mapRowToProfile(row: UserProfileRow): UserProfile {
  const profile: UserProfile = {
    userId: asUserId(row.user_id),
    displayName: row.display_name,
    activeRoles: JSON.parse(row.active_roles) as AppRole[],
    currentRole: row.current_role,
    deviceAuthEnabled: Boolean(row.device_auth_enabled),
    identityStatus: row.identity_status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };

  if (row.phone_hash) {
    profile.phoneHash = row.phone_hash;
  }

  if (row.phone_masked) {
    profile.phoneMasked = row.phone_masked;
  }

  if (row.profile_validated_at) {
    profile.profileValidatedAt = row.profile_validated_at;
  }

  return profile;
}

export function createSqliteUserRepository(
  database: SqlStatementExecutor,
): UserRepositoryPort {
  return {
    async getProfile() {
      const row = await database.queryOne<UserProfileRow>(
        `SELECT
          user_id,
          display_name,
          phone_masked,
          phone_hash,
          current_role,
          active_roles,
          device_auth_enabled,
          identity_status,
          profile_validated_at,
          created_at,
          updated_at
        FROM user_profile
        LIMIT 1`,
      );

      return row ? mapRowToProfile(row) : null;
    },
    async saveProfile(profile) {
      await database.execute(
        `INSERT INTO user_profile (
          user_id,
          display_name,
          phone_masked,
          phone_hash,
          current_role,
          active_roles,
          device_auth_enabled,
          identity_status,
          profile_validated_at,
          created_at,
          updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(user_id) DO UPDATE SET
          display_name = excluded.display_name,
          phone_masked = excluded.phone_masked,
          phone_hash = excluded.phone_hash,
          current_role = excluded.current_role,
          active_roles = excluded.active_roles,
          device_auth_enabled = excluded.device_auth_enabled,
          identity_status = excluded.identity_status,
          profile_validated_at = excluded.profile_validated_at,
          updated_at = excluded.updated_at`,
        [
          profile.userId,
          profile.displayName,
          profile.phoneMasked ?? null,
          profile.phoneHash ?? null,
          profile.currentRole,
          JSON.stringify(profile.activeRoles),
          profile.deviceAuthEnabled ? 1 : 0,
          profile.identityStatus,
          profile.profileValidatedAt ?? null,
          profile.createdAt,
          profile.updatedAt,
        ],
      );
    },
  };
}
