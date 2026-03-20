export type SqlStatementExecutor = {
  execute: (statement: string, params?: readonly unknown[]) => Promise<void>;
  queryOne: <TRow>(
    statement: string,
    params?: readonly unknown[],
  ) => Promise<TRow | null>;
};
