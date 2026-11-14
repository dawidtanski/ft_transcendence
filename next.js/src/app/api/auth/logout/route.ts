import { getAuthConfig } from "@/lib/auth/config";
import {
  authErrorResponse,
  jsonResponse,
  readSmallJson,
  requireSameOriginJson,
} from "@/lib/auth/http";
import { clearSessionCookie, revokeSession } from "@/lib/auth/session";
import { NextRequest } from "next/server";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    requireSameOriginJson(request);
    await readSmallJson(request);

    const token = request.cookies.get(getAuthConfig().cookieName)?.value;
    await revokeSession(token);

    const response = jsonResponse({ ok: true });
    clearSessionCookie(response);
    return response;
  } catch (error) {
    return authErrorResponse(error);
  }
}
