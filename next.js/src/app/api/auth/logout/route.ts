import { NextRequest, NextResponse } from "next/server";

import { appUrl } from "@/lib/auth/google";
import {
  COOKIE_OPTIONS,
  deleteSession,
  SESSION_COOKIE,
} from "@/lib/auth/session";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const expectedOrigin = appUrl("/").origin;

  if (request.headers.get("origin") !== expectedOrigin) {
    return NextResponse.json(
      { error: "Forbidden" },
      { status: 403 },
    );
  }

  const token = request.cookies.get(SESSION_COOKIE)?.value;

  if (token) {
    await deleteSession(token);
  }

  const response = NextResponse.redirect(appUrl("/sign-in"), 303);

  response.headers.set("Cache-Control", "no-store");
  response.cookies.set(SESSION_COOKIE, "", {
    ...COOKIE_OPTIONS,
    maxAge: 0,
  });

  return response;
}