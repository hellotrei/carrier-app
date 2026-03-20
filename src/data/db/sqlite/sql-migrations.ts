export const sqlMigrations = [
  {
    version: 1,
    statements: [
      `CREATE TABLE IF NOT EXISTS user_profile (
        user_id TEXT PRIMARY KEY NOT NULL,
        display_name TEXT NOT NULL,
        phone_masked TEXT,
        phone_hash TEXT,
        current_role TEXT NOT NULL,
        active_roles TEXT NOT NULL DEFAULT '[]',
        device_auth_enabled INTEGER NOT NULL DEFAULT 0,
        identity_status TEXT NOT NULL DEFAULT 'draft',
        driver_readiness_status TEXT,
        vehicles_json TEXT,
        has_spare_helmet INTEGER NOT NULL DEFAULT 0,
        profile_validated_at TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );`,
      `CREATE TABLE IF NOT EXISTS order_table (
        order_id TEXT PRIMARY KEY NOT NULL,
        booking_session_id TEXT NOT NULL,
        customer_id TEXT NOT NULL,
        partner_id TEXT NOT NULL,
        rider_declared_name TEXT NOT NULL,
        pickup_json TEXT NOT NULL,
        destination_json TEXT NOT NULL,
        estimated_price REAL NOT NULL,
        status TEXT NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );`,
      `CREATE TABLE IF NOT EXISTS app_settings (
        key TEXT PRIMARY KEY NOT NULL,
        value TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );`,
    ],
  },
  {
    version: 2,
    statements: [
      `ALTER TABLE user_profile ADD COLUMN driver_readiness_status TEXT;`,
      `ALTER TABLE user_profile ADD COLUMN vehicles_json TEXT;`,
      `ALTER TABLE user_profile ADD COLUMN has_spare_helmet INTEGER NOT NULL DEFAULT 0;`,
    ],
  },
] as const;
