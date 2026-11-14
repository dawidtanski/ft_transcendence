import { getCurrentUser } from "@/lib/auth/session";
import { authErrorResponse, jsonResponse } from "@/lib/auth/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
	try {
		const user = await getCurrentUser();
		if (!user) return jsonResponse({ error: "Not authenticated." }, 401);
		return jsonResponse({ user });
	} catch (error) {
		return authErrorResponse(error);
	}
}