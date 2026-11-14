import { NextRequest } from "next/server";
import { getAuthConfig } from "@/lib/auth/config";
import { clearSessionCookie, revokeSession } from "@/lib/auth/session";
import { authErrorResponse, jsonResponse, readSmallJson, requireSameOriginJson } from "@/lib/auth/http";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
	try {
		requireSameOriginJson(request);
		await readSmallJson(request); // The provided button sends {}.
		const token = request.cookies.get(getAuthConfig().cookieName)?.value;
		await revokeSession(token);
		const response = jsonResponse({ ok: true });
		clearSessionCookie(response);
		return response;
	} catch (error) {
		return authErrorResponse(error);
	}
}