import "server-only";
import { createHash, randomBytes } from "node:crypto";
import { and, eq, gt, sql } from "drizzle-orm";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { usersTable } from "@/db/schema";
import { loginSessionsTable as sessions } from "@/db/auth-tables";
import { getAuthConfig, IDLE_SECONDS, SESSION_SECONDS } from "./config";

type NewSession = { token: string; expiresAt: Date };
const tokenPattern = /^[a-f0-9]{64}$/;
const digest = (token: string) => createHash("sha256").update(token).digest("hex");

// Call only on the server AFTER validating a password or verified OAuth identity.
// This is not an HTTP endpoint and must never accept a browser-selected user ID.
export async function createSession(userId: number, previousToken?: string): Promise<NewSession> {
  if (!Number.isSafeInteger(userId) || userId <= 0) throw new Error("Invalid application user ID.");
  const token = randomBytes(32).toString("hex");
  const record = await db.transaction(async (tx) => {
    if (previousToken && tokenPattern.test(previousToken)) {
      await tx.delete(sessions).where(eq(sessions.tokenHash, digest(previousToken)));
    }
    const [created] = await tx.insert(sessions).values({
      tokenHash: digest(token), userId,
      expiresAt: sql`now() + ${SESSION_SECONDS} * interval '1 second'`,
      idleExpiresAt: sql`now() + ${IDLE_SECONDS} * interval '1 second'`,
    }).returning({ expiresAt: sessions.expiresAt });
    if (!created) throw new Error("Session creation failed.");
    return created;
  });
  return { token, expiresAt: record.expiresAt };
}

function cookieOptions() {
  return { httpOnly: true, secure: getAuthConfig().secure, sameSite: "lax" as const, path: "/" };
}

export function setSessionCookie(response: NextResponse, session: NewSession): void {
  response.cookies.set(getAuthConfig().cookieName, session.token, {
    ...cookieOptions(), maxAge: SESSION_SECONDS, expires: session.expiresAt,
  });
}

export function clearSessionCookie(response: NextResponse): void {
  response.cookies.set(getAuthConfig().cookieName, "", {
    ...cookieOptions(), maxAge: 0, expires: new Date(0),
  });
}

export async function revokeSession(token?: string): Promise<void> {
  if (token && tokenPattern.test(token)) {
    await db.delete(sessions).where(eq(sessions.tokenHash, digest(token)));
  }
}

export async function getCurrentUser() {
  const token = (await cookies()).get(getAuthConfig().cookieName)?.value;
  if (!token || !tokenPattern.test(token)) return null;

  // Renew only idle expiry, never absolute expiry. Both checks happen on the server.
  const [active] = await db.update(sessions).set({
    idleExpiresAt: sql`least(${sessions.expiresAt}, now() + ${IDLE_SECONDS} * interval '1 second')`,
  }).where(and(
    eq(sessions.tokenHash, digest(token)),
    gt(sessions.expiresAt, sql`now()`),
    gt(sessions.idleExpiresAt, sql`now()`),
  )).returning({ userId: sessions.userId });
  if (!active) return null;

  // Explicit projection: no password_hash, Google claims, or session token returned.
  const [user] = await db.select({
    id: usersTable.id, nickname: usersTable.nickname,
    name: usersTable.name, email: usersTable.email,
    avatarURL: usersTable.avatarURL, points: usersTable.points,
  }).from(usersTable).where(eq(usersTable.id, active.userId)).limit(1);
  return user ?? null;
}

// Page helper. APIs should return 401 instead of redirecting an API caller.
export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");
  return user;
}