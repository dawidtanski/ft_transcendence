import "server-only";
import { sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { usersTable } from "../schema";

export async function findUserForPasswordLogin(normalizedEmail: string) {
	const rows = await db.select({
		id: usersTable.id,
		passwordHash: usersTable.password_hash,
	}).from(usersTable)
		.where(sql`lower(btrim(${usersTable.email})) = ${normalizedEmail}`)
		.limit(2);

	// The proposed unique index should guarantee one row. Until it is applied,
	// fail closed instead of arbitrarily selecting a case-variant duplicate.
	return rows.length === 1 ? rows[0] : null;
}