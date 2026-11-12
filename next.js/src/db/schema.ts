import { sql } from "drizzle-orm";
import { check, integer, pgTable, timestamp, unique, varchar, text, index } from "drizzle-orm/pg-core";

export const usersTable = pgTable("users", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  nickname: varchar({ length: 50 }).notNull().unique(), // Manage error with duplicate Nickname
  name: varchar({ length: 50 }).notNull(),
  surName: varchar({ length: 50 }).notNull(),
  email: varchar({ length: 255 }).notNull().unique(),
  age: integer().notNull(),
  avatarURL: varchar("avatar_url").notNull().default("https://api.dicebear.com/10.x/lorelei/svg?seed=default"),
  password_hash: varchar({ length: 255 }),
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
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
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
    senderId: integer("sender_id").notNull().references(() => usersTable.id),
    body: text("body").notNull(),
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

export const oauthAccountsTable = pgTable("oauth_accounts",{
	user_id: integer().notNull().references(()=>usersTable.id, { onDelete: "cascade" }),
	provider: varchar({ length: 255 }).notNull(),
	provider_sub: varchar({ length: 255 }).notNull(),
},
(table) => [
	unique().on(table.provider, table.provider_sub),
]);

export const sessionsTable = pgTable("sessions",{
	token_hash: varchar({ length: 255 }).primaryKey(),
	user_id: integer()
		.notNull()
		.references(() => usersTable.id, { onDelete: "cascade" }),
	expires_at: timestamp({ withTimezone: true, mode: "date" }).notNull(),
	},
	(table) => [
	index("sessions_user_id_idx").on(table.user_id),
	]
);

// export const googleTokenTable = pgTable("tokens", {
// 	iss: varchar({ length: 255 }).notNull(),
// 	azp: varchar({ length: 255 }).notNull(),
// 	aud: varchar({ length: 255 }).notNull(),
// 	sub: varchar({ length: 255 }).notNull(),
// 	at_hash: varchar({ length: 255 }).primaryKey().notNull(),
// 	hd: varchar({ length: 255 }).notNull(),
// 	email: varchar({ length: 255 }).notNull(),
// 	email_verified: boolean(),
// 	iat: integer(),	// might be problem with overloading
// 	exp: integer().notNull(), // might be problem with overloading
// 	nonce: integer().notNull()
// });

// export const highlightsTable = pgTable("highlights",{

// });

// export conwt userAchievementsTable = pgTable("achievements",{

// });
