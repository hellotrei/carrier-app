import type { SqlStatementExecutor } from './database-port';
import { sqlMigrations } from './sql-migrations';

export async function initializeDatabase(
  database: SqlStatementExecutor,
): Promise<void> {
  for (const migration of sqlMigrations) {
    for (const statement of migration.statements) {
      try {
        await database.execute(statement);
      } catch (error) {
        if (
          error instanceof Error &&
          (error.message.includes('duplicate column name') ||
            error.message.includes('already exists'))
        ) {
          continue;
        }

        throw error;
      }
    }
  }
}
