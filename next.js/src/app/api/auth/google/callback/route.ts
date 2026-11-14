import * as client from "openid-client";
import { NextRequest, NextResponse } from "next/server";

import {
  appUrl,
  getGoogleConfig,
  getGoogleRedirectUri,
} from "@/lib/auth/google";

import {
  consumeLoginAttempt,
  LOGIN_COOKIE,
} from "@/lib/auth/attempt";

import {
  EmailAlreadyUsedError,
  findOrCreateGoogleUser,
} from "@/lib/auth/account";

import {
  COOKIE_OPTIONS,
  createSession,
  SESSION_COOKIE,
} from "@/lib/auth/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function finish(response: NextResponse): NextResponse {
  response.headers.set("Cache-Control", "no-store");

  response.cookies.set(LOGIN_COOKIE, "", {
    ...COOKIE_OPTIONS,
    maxAge: 0,
  });

  return response;
}

export async function GET(request: NextRequest) {
  let callbackUrl: URL;

  try {
    callbackUrl = new URL(getGoogleRedirectUri());
  } catch {
    console.error("Invalid Google redirect URI configuration");

    return finish(
      NextResponse.json(
        { error: "Authentication configuration error" },
        { status: 500 },
      ),
    );
  }

  const failure = (error: string) => {
    const url = new URL("/sign-in", callbackUrl.origin);
    url.searchParams.set("error", error);

    return finish(NextResponse.redirect(url));
  };

  try {
    const attemptToken = request.cookies.get(LOGIN_COOKIE)?.value;

    if (!attemptToken) {
      return failure("expired");
    }

    const attempt = await consumeLoginAttempt(attemptToken);

    if (!attempt) {
      return failure("expired");
    }

    const config = await getGoogleConfig();

    callbackUrl.search = request.nextUrl.search;

    const tokens = await client.authorizationCodeGrant(
      config,
      callbackUrl,
      {
        pkceCodeVerifier: attempt.code_verifier,
        expectedState: attempt.state,
        expectedNonce: attempt.nonce,
        idTokenExpected: true,
      },
    );

    const claims = tokens.claims();

    if (
      !claims ||
      typeof claims.sub !== "string" ||
      claims.sub.length === 0 ||
      typeof claims.email !== "string" ||
      claims.email.length === 0 ||
      claims.email.length > 255 ||
      claims.email_verified !== true
    ) {
      return failure("identity");
    }

    const userId = await findOrCreateGoogleUser({
      sub: claims.sub,
      email: claims.email,
    });

    const previousToken =
      request.cookies.get(SESSION_COOKIE)?.value;

    const session = await createSession(userId, previousToken);

    const response = NextResponse.redirect(appUrl("/profilePage"));

    response.cookies.set(SESSION_COOKIE, session.token, {
      ...COOKIE_OPTIONS,
      expires: session.expiresAt,
    });

    return finish(response);
  } catch (error) {
    if (error instanceof EmailAlreadyUsedError) {
      return failure("email_in_use");
    }

    console.error("Google callback failed", {
      name: error instanceof Error ? error.name : "UnknownError",
    });

    return failure("oauth");
  }
}