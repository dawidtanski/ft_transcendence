import nextEnv from "@next/env";
import { or, eq, sql } from "drizzle-orm";
import { isAcceptableNewPassword, parseLoginInput } from "../src/lib/auth/input";

function refuseProduction(): void {
	if (process.env.NODE_ENV === "production") throw new Error("Refusing production mode.");
}

async function main() {
	refuseProduction();
	if (!process.argv.includes("--confirm-development-database")) {
		throw new Error("Check the database target, then pass --confirm-development-database.");
	}
	// Run from next.js/, not the repository root. Load env BEFORE importing db.ts.
	nextEnv.loadEnvConfig(process.cwd(), true);
	refuseProduction();
	const input = parseLoginInput({
		email: process.env.AUTH_TEST_EMAIL,
		password: process.env.AUTH_TEST_PASSWORD,
	});
	const nickname = process.env.AUTH_TEST_NICKNAME?.trim();
	if (!input || !isAcceptableNewPassword(input.password) || !nickname || nickname.length > 50) {
		throw new Error("Set a valid AUTH_TEST_EMAIL, AUTH_TEST_NICKNAME (1-50), and AUTH_TEST_PASSWORD (15-128).");
	}
	for (const name of ["PGHOST", "PGDATABASE", "PGUSER", "PGSSLROOTCERT"]) {
		if (!process.env[name]) throw new Error(`${name} must be explicitly configured for this script.`);
	}
	console.info("Development database target:", {
		host: process.env.PGHOST, database: process.env.PGDATABASE,
	});
	const { db } = await import("../src/lib/db");
	const { usersTable } = await import("../src/db/schema");
	const { hashNewPassword } = await import("../src/lib/auth/password");
	try {
		const existing = await db.select({ id: usersTable.id }).from(usersTable).where(or(
		sql`lower(btrim(${usersTable.email})) = ${input.email}`,
		eq(usersTable.nickname, nickname),
		)).limit(1);
		if (existing.length) throw new Error("Email or nickname already exists; no account was changed.");
		const passwordHash = await hashNewPassword(input.password);
		const [user] = await db.insert(usersTable).values({
		nickname, email: input.email, password_hash: passwordHash,
		// Explicitly synthetic development data to satisfy the existing schema.
		name: "Local", surName: "Test", age: 18,
		avatarURL: "https://api.dicebear.com/10.x/lorelei/svg?seed=" + encodeURIComponent(nickname),
		// google_hash is deliberately omitted: the schema must allow NULL.
		}).returning({ id: usersTable.id });
		console.info("Created local test user, ID:", user?.id);
	} finally {
		await db.$client.end();
	}
}

main().catch((error: unknown) => {
	// Do not print full driver errors containing SQL parameters or credentials.
	const dbError = typeof error === "object" && error !== null && "query" in error;
	console.error(dbError ? "Database operation failed. Check migrations, TLS and uniqueness."
		: error instanceof Error ? error.message : "Provisioning failed.");
	process.exitCode = 1;
});