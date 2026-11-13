import "server-only";

import { createHash, randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { and, eq, gt } from "drizzle-orm";

import { db } from "@/lib/db";
import { sessionsTable, usersTable } from "@/db/schema";

export const SESSION_COOKIE = "__Host-session";

export const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: true,
  sameSite: "lax",
  path: "/",
} as const;

const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000;

export function randomToken(): string {
  return randomBytes(32).toString("base64url");
}

export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export async function createSession(
  userId: number,
  previousToken?: string,
) {
  const token = randomToken();
  const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);

  await db.transaction(async (tx) => {
    if (previousToken) {
      await tx
        .delete(sessionsTable)
        .where(eq(sessionsTable.token_hash, hashToken(previousToken)));
    }

    await tx.insert(sessionsTable).values({
      token_hash: hashToken(token),
      user_id: userId,
      expires_at: expiresAt,
    });
  });

  return { token, expiresAt };
}

export async function deleteSession(token: string) {
  await db
    .delete(sessionsTable)
    .where(eq(sessionsTable.token_hash, hashToken(token)));
}

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;

  if (!token) {
    return null;
  }

  const [user] = await db
    .select({
      id: usersTable.id,
      nickname: usersTable.nickname,
      email: usersTable.email,
      avatarURL: usersTable.avatarURL,
      points: usersTable.points,
    })
    .from(sessionsTable)
    .innerJoin(usersTable, eq(sessionsTable.user_id, usersTable.id))
    .where(
      and(
        eq(sessionsTable.token_hash, hashToken(token)),
        gt(sessionsTable.expires_at, new Date()),
      ),
    )
    .limit(1);

  return user ?? null;
}