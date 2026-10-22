import "server-only";
import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";

const globalForDb = globalThis as typeof globalThis & {
  pgPool?: Pool;
};

const pool =
  globalForDb.pgPool ??
  new Pool({
    max: 10,
    connectionTimeoutMillis: 5000,
  });

if (process.env.NODE_ENV !== "production") {
  globalForDb.pgPool = pool;
}

export const db = drizzle(pool);