import { defineConfig } from "drizzle-kit";
import { readFileSync } from "node:fs";

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dbCredentials: {
	ssl: process.env.PGSSLROOTCERT
		?{
			ca: readFileSync(process.env.PGSSLROOTCERT, "utf8"),
			rejectUnauthorized: true,
    	}
  		: false,
    host: process.env.PGHOST!,
    port: Number(process.env.PGPORT ?? 5432),
    user: process.env.PGUSER!,
    password: process.env.PGPASSWORD!,
    database: process.env.PGDATABASE!,
  },
});
