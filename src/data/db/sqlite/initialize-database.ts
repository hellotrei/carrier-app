import type { SqlStatementExecutor } from './database-port';
import { sqlMigrations } from './sql-migrations';

export async function initializeDatabase(
  database: SqlStatementExecutor,
): Promise<void> {
  for (const migration of sqlMigrations) {
    for (const statement of migration.statements) {
      await database.execute(statement);
    }
  }
}
