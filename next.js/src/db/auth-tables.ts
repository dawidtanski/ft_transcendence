import { index, integer, pgTable, timestamp, varchar } from "drizzle-orm/pg-core";
import { usersTable } from "./schema";

// Both password and OAuth logins must use this same session table.
// Only the SHA-256 digest of the random browser token is stored here.
export const loginSessionsTable = pgTable("login_sessions", {
	tokenHash: varchar("token_hash", { length: 64 }).primaryKey(),
	userId: integer("user_id").notNull()
		.references(() => usersTable.id, { onDelete: "cascade" }),
	createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
	expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
	idleExpiresAt: timestamp("idle_expires_at", { withTimezone: true }).notNull(),
}, (table) => [
	index("login_sessions_user_idx").on(table.userId),
	index("login_sessions_expiry_idx").on(table.expiresAt),
	index("login_sessions_idle_expiry_idx").on(table.idleExpiresAt),
]);

// A shared database counter, not a process-local Map. This also works when
// requests reach different Next.js processes using the same database.
export const loginRateLimitsTable = pgTable("login_rate_limits", {
	keyHash: varchar("key_hash", { length: 64 }).primaryKey(),
	attempts: integer("attempts").notNull(),
	resetAt: timestamp("reset_at", { withTimezone: true }).notNull(),
}, (table) => [
	index("login_rate_limits_reset_idx").on(table.resetAt),
]);