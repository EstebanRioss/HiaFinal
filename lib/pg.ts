// lib/pg.ts
import { Pool } from "pg";

let _pool: Pool | null = null;

function createPool() {
  if (_pool) return _pool;
  _pool = new Pool({
    host: process.env.DB_HOST || "db",
    user: process.env.DB_USER || "postgres",
    password: process.env.DB_PASS || "postgres",
    database: process.env.DB_NAME || "hia",
    port: Number(process.env.DB_PORT) || 5432,
  });
  return _pool;
}

export const pool = {
  query: (text: string, params?: any[]) => createPool().query(text, params),
};

export async function query<T = any>(text: string, params?: any[]): Promise<{ rows: T[]; rowCount: number }> {
  const result = await (createPool().query as any)(text, params);
  return { rows: result.rows, rowCount: result.rowCount || 0 };
}