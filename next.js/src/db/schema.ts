import { table } from "console";
import { sql } from "drizzle-orm";
import { check, integer, pgTable, timestamp, unique, varchar, text, index } from "drizzle-orm/pg-core";

export const usersTable = pgTable("users", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  nickname: varchar({ length: 50 }).notNull().unique(), // Manage error with duplicate Nickname
  name: varchar({ length: 50 }).notNull(),
  surName: varchar({ length: 50 }).notNull(),
  email: varchar({ length: 255 }).notNull().unique(),
  age: integer().notNull(),
  avatarURL: varchar("avatar_url").notNull().default(sql`('https://api.dicebear.com/10.x/lorelei/svg?seed=' || username)`),
  password_hash: varchar({ length: 255 }).notNull(),
  points: integer().notNull().default(0),
},
  (table) => [
    check("email_check", sql`${table.email} LIKE '%@%'`),
    check("age_check", sql`${table.age} >= 12 AND ${table.age} <= 150`)
  ]);

export const chatsTable = pgTable("chats",
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    firstUserId: integer("first_user_id").notNull().references(() => usersTable.id),
    secondUserId: integer("second_user_id").notNull().references(() => usersTable.id),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull() .defaultNow(),
  },
  (table) => [
    unique("chats_users_unique").on(
      table.firstUserId,
      table.secondUserId,
    ),
    check(
      "chats_users_order",
      sql`${table.firstUserId} < ${table.secondUserId}`,
    ),
  ],
);

export const messagesTable = pgTable(
  "messages",
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    chatId: integer("chat_id").notNull().references(() => chatsTable.id),
    senderId: integer("sender_id").notNull().references(() => usersTable.id),body: text("body").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("messages_chat_history_idx").on(
      table.chatId,
      table.createdAt,
      table.id,
    ),

    check(
      "messages_body_not_empty",
      sql`length(btrim(${table.body})) > 0`,
    ),
  ],
);

// export const highlightsTable = pgTable("highlights",{

// });

// export conwt userAchievementsTable = pgTable("achievements",{

// });
