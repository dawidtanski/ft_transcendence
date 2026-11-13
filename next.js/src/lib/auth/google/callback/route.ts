import "server-only";

import { randomBytes } from "node:crypto";
import { and, eq, sql } from "drizzle-orm";

import { db } from "@/lib/db";
import { oauthAccountsTable, usersTable } from "@/db/schema";

export class EmailAlreadyUsedError extends Error {}

type GoogleIdentity = {
  sub: string;
  email: string;
};

export async function findOrCreateGoogleUser(
  identity: GoogleIdentity,
): Promise<number> {
  return db.transaction(async (tx) => {
    // Serialize creation of the same Google account.
    const accountKey = `google:${identity.sub}`;

    await tx.execute(
      sql`select pg_advisory_xact_lock(
        hashtextextended(${accountKey}, 0)
      )`,
    );

    const [account] = await tx
      .select({ userId: oauthAccountsTable.user_id })
      .from(oauthAccountsTable)
      .where(
        and(
          eq(oauthAccountsTable.provider, "google"),
          eq(oauthAccountsTable.provider_sub, identity.sub),
        ),
      )
      .limit(1);

    if (account) {
      return account.userId;
    }

    const [user] = await tx
      .insert(usersTable)
      .values({
        nickname: `google_${randomBytes(16).toString("hex")}`,
        email: identity.email,
      })
      .onConflictDoNothing({ target: usersTable.email })
      .returning({ id: usersTable.id });

    if (!user) {
      throw new EmailAlreadyUsedError();
    }

    await tx.insert(oauthAccountsTable).values({
      user_id: user.id,
      provider: "google",
      provider_sub: identity.sub,
    });

    return user.id;
  });
}