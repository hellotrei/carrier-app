export type SqlStatementExecutor = {
  execute: (statement: string, params?: readonly unknown[]) => Promise<void>;
  queryAll: <TRow>(
    statement: string,
    params?: readonly unknown[],
  ) => Promise<TRow[]>;
  queryOne: <TRow>(
    statement: string,
    params?: readonly unknown[],
  ) => Promise<TRow | null>;
};
