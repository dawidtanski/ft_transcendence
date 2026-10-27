import { table } from "console";
import { sql } from "drizzle-orm";
import { check, integer, pgTable, varchar } from "drizzle-orm/pg-core";
import { text } from "stream/consumers";

export const usersTable = pgTable("users", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  nickname: varchar({ length: 50 }).notNull().unique(), // Manage error with duplicate Nickname
  name: varchar({length: 50}).notNull(),
  surName: varchar({length: 50}).notNull(),
  email: varchar({length:255}).notNull().unique(),
  age: integer().notNull(),
  avatarURL: varchar("avatar_url").notNull().default(sql`('https://api.dicebear.com/10.x/lorelei/svg?seed=' || username)`),
  password_hash: varchar({length:255}).notNull(),
},
  (table) => [
	check("email_check", sql`${table.email} LIKE '%@%'`),
  	check("age_check", sql`${table.age} >= 12 AND ${table.age} <= 150`)
]);