import * as client from "openid-client";
import { NextResponse } from "next/server";

import {
  appUrl,
  getGoogleConfig,
  getGoogleRedirectUri,
} from "@/lib/auth/google";
import {
  createLoginAttempt,
  LOGIN_COOKIE,
  LOGIN_DURATION_SECONDS,
} from "@/lib/auth/attempt";
import { COOKIE_OPTIONS } from "@/lib/auth/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const config = await getGoogleConfig();
    const attempt = await createLoginAttempt();

    const challenge = await client.calculatePKCECodeChallenge(
      attempt.codeVerifier,
    );

    const authorizationUrl = client.buildAuthorizationUrl(config, {
      redirect_uri: getGoogleRedirectUri(),
      response_type: "code",
      scope: "openid email",
      state: attempt.state,
      nonce: attempt.nonce,
      code_challenge: challenge,
      code_challenge_method: "S256",
    });

    const response = NextResponse.redirect(authorizationUrl);

    response.headers.set("Cache-Control", "no-store");
    response.cookies.set(LOGIN_COOKIE, attempt.token, {
      ...COOKIE_OPTIONS,
      maxAge: LOGIN_DURATION_SECONDS,
    });

    return response;
  } catch {
    console.error("Could not start Google login");

    const response = NextResponse.redirect(
      appUrl("/sign-in?error=oauth"),
    );

    response.headers.set("Cache-Control", "no-store");
    return response;
  }
}