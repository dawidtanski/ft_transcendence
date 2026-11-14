import "server-only";
import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { readFileSync } from "node:fs";

const globalForDb = globalThis as typeof globalThis & {
  pgPool?: Pool;
};

const sslCertPath = process.env.PGSSLROOTCERT;
const sslConfig = sslCertPath
  ? {
      ca: readFileSync(sslCertPath, "utf8"),
      rejectUnauthorized: true,
    }
  : false;

const pool =
  globalForDb.pgPool ??
  new Pool({
    host: process.env.PGHOST ?? "localhost",
    port: Number(process.env.PGPORT ?? 5432),
    user: process.env.PGUSER,
    password: process.env.PGPASSWORD,
    database: process.env.PGDATABASE,
    max: 10,
    ssl: sslConfig,
    connectionTimeoutMillis: 5000,
  });

if (process.env.NODE_ENV !== "production") {
  globalForDb.pgPool = pool;
}

export const db = drizzle(pool);