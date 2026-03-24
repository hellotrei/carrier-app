import { open, type DB, type Scalar } from '@op-engineering/op-sqlite';

import type { SqlStatementExecutor } from './database-port';

const DATABASE_NAME = 'carrier.sqlite';

let database: DB | null = null;

function getDatabase(): DB {
  if (database) {
    return database;
  }

  database = open({
    name: DATABASE_NAME,
  });

  return database;
}

export function createCarrierDatabase(): SqlStatementExecutor {
  return {
    async execute(statement: string, params?: readonly unknown[]) {
      await getDatabase().execute(statement, params as Scalar[] | undefined);
    },
    async queryAll<TRow>(statement: string, params?: readonly unknown[]) {
      const result = await getDatabase().execute(
        statement,
        params as Scalar[] | undefined,
      );

      return result.rows as TRow[];
    },
    async queryOne<TRow>(statement: string, params?: readonly unknown[]) {
      const result = await getDatabase().execute(
        statement,
        params as Scalar[] | undefined,
      );

      const firstRow = result.rows[0];

      if (!firstRow) {
        return null;
      }

      return firstRow as TRow;
    },
  };
}
