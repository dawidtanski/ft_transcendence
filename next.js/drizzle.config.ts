import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dbCredentials: {
    // Local PostgreSQL in Compose does not configure TLS.
    ssl: false,
    host: process.env.PGHOST!,
    port: Number(process.env.PGPORT ?? 5432),
    user: process.env.PGUSER!,
    password: process.env.PGPASSWORD!,
    database: process.env.PGDATABASE!,
  },
});
