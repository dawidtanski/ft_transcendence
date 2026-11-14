import "server-only";

import * as client from "openid-client";
import { and, eq, gt } from "drizzle-orm";

import { db } from "@/lib/db";
import { oauthLoginAttemptsTable } from "@/db/schema";
import { hashToken, randomToken } from "./session";

export const LOGIN_COOKIE = "__Host-oauth-attempt";
export const LOGIN_DURATION_SECONDS = 10 * 60;

export async function createLoginAttempt() {
  const token = randomToken();
  const state = client.randomState();
  const nonce = client.randomNonce();
  const codeVerifier = client.randomPKCECodeVerifier();

  await db.insert(oauthLoginAttemptsTable).values({
    token_hash: hashToken(token),
    state,
    nonce,
    code_verifier: codeVerifier,
    expires_at: new Date(
      Date.now() + LOGIN_DURATION_SECONDS * 1000,
    ),
  });

  return { token, state, nonce, codeVerifier };
}

export async function consumeLoginAttempt(token: string) {
  const [attempt] = await db
    .delete(oauthLoginAttemptsTable)
    .where(
      and(
        eq(oauthLoginAttemptsTable.token_hash, hashToken(token)),
        gt(oauthLoginAttemptsTable.expires_at, new Date()),
      ),
    )
    .returning();

  return attempt ?? null;
}