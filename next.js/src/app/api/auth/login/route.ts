import { NextRequest } from "next/server";
import { findUserForPasswordLogin } from "@/db/queries/auth-users";
import { getAuthConfig } from "@/lib/auth/config";
import { parseLoginInput } from "@/lib/auth/input";
import { verifyPassword } from "@/lib/auth/password";
import { enforceAccountLimit, enforceRequestLimits } from "@/lib/auth/rate-limit";
import { createSession, setSessionCookie } from "@/lib/auth/session";
import { AuthHttpError, authErrorResponse, jsonResponse,
	readSmallJson, requireSameOriginJson } from "@/lib/auth/http";

export const runtime = "nodejs"; // pg and native Argon2 are server-side Node libraries.

export async function POST(request: NextRequest) {
	try {
		requireSameOriginJson(request);
		await enforceRequestLimits(request);
		const input = parseLoginInput(await readSmallJson(request));
		if (!input) throw new AuthHttpError(400, "Enter a valid email and password.");
		await enforceAccountLimit(input.email);

		const user = await findUserForPasswordLogin(input.email);
		const valid = await verifyPassword(user?.passwordHash, input.password);
		if (!user || !valid) throw new AuthHttpError(401, "Invalid email or password.");

		const previous = request.cookies.get(getAuthConfig().cookieName)?.value;
		const session = await createSession(user.id, previous);
		const response = jsonResponse({ ok: true });
		setSessionCookie(response, session);
		return response;
	} catch (error) {
		return authErrorResponse(error);
	}
}