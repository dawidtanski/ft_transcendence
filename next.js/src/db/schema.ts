import { integer, pgTable, varchar } from "drizzle-orm/pg-core";

export const usersTable = pgTable("users", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  nickname: varchar({ length: 50 }).notNull().unique(), // Manage error with duplicate Nickname
  name: varchar({length: 50}).notNull(),
  surName: varchar({length: 50}).notNull(),
  mail: varchar({lenght:255}).notNull().unique(),

});