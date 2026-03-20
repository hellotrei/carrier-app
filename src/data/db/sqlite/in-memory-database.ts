import type { SqlStatementExecutor } from './database-port';

export function createInMemoryDatabase(): SqlStatementExecutor {
  return {
    async execute() {},
    async queryOne() {
      return null;
    },
  };
}
