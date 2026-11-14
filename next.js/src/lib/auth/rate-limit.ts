import "server-only";
import { createHmac } from "node:crypto";
import { isIP } from "node:net";
import { sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { loginRateLimitsTable as buckets } from "@/db/auth-tables";
import { getAuthConfig } from "./config";
import { AuthHttpError } from "./http";

async function consumeBucket(scope: string, value: string, max: number, seconds: number) {
  const keyHash = createHmac("sha256", getAuthConfig().rateLimitKey)
    .update(`${scope}:${value}`).digest("hex");
  // Atomic UPSERT: simultaneous requests cannot all read an old counter.
  const [result] = await db.insert(buckets).values({
    keyHash,
    attempts: 1,
    resetAt: sql`now() + ${seconds} * interval '1 second'`,
  }).onConflictDoUpdate({
    target: buckets.keyHash,
    set: {
      attempts: sql`case when ${buckets.resetAt} <= now() then 1
        else least(${buckets.attempts} + 1, 1000000) end`,
      resetAt: sql`case when ${buckets.resetAt} <= now()
        then now() + ${seconds} * interval '1 second' else ${buckets.resetAt} end`,
    },
  }).returning({ attempts: buckets.attempts, resetAt: buckets.resetAt });
  if (!result) throw new Error("Rate limiter did not return a counter.");
  if (result.attempts > max) {
    const retryAfter = Math.max(1, Math.ceil((result.resetAt.getTime() - Date.now()) / 1000));
    throw new AuthHttpError(429, "Too many attempts. Try again later.", retryAfter);
  }
}

export async function enforceRequestLimits(request: Request) {
  const config = getAuthConfig();
  let client = "shared-development-client";
  if (config.trustProxy) {
    const ip = request.headers.get("x-real-ip");
    if (!ip || isIP(ip) === 0) throw new Error("Trusted proxy did not supply a valid X-Real-IP.");
    client = ip;
  }
  // Conservative defaults for a small school project; tune after load testing.
  // Global protection also bounds work when many different account names are used.
  await consumeBucket("global", "password-login", 150, 60);
  await consumeBucket("ip", client, 20, 60);
}

export async function enforceAccountLimit(email: string) {
  // Applied to all attempts, even unknown emails and successful logins.
  // This is intentionally not extended by blocked attempts.
  await consumeBucket("account", email, 10, 15 * 60);
}