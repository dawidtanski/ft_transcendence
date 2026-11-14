import "server-only";

// These are deliberate project policy choices, not library defaults.
export const SESSION_SECONDS = 8 * 60 * 60;
export const IDLE_SECONDS = 30 * 60;

export function getAuthConfig() {
	const rawOrigin = process.env.APP_ORIGIN;
	if (!rawOrigin) throw new Error("APP_ORIGIN is required.");

	const url = new URL(rawOrigin);
	if (!["https:", "http:"].includes(url.protocol) ||
		url.username || url.password || url.search || url.hash || url.pathname !== "/") {
		throw new Error("APP_ORIGIN must be an HTTP(S) origin without a path.");
	}
	const secure = url.protocol === "https:";
	if (process.env.NODE_ENV === "production" && !secure) {
		throw new Error("Production authentication requires HTTPS.");
	}
	const trustProxy = process.env.AUTH_TRUST_PROXY === "true";
	if (process.env.NODE_ENV === "production" && !trustProxy) {
		throw new Error("Configure a trusted, isolated reverse proxy before production login.");
	}
	const secret = process.env.AUTH_RATE_LIMIT_SECRET;
	if (!secret || !/^[a-fA-F0-9]{64}$/.test(secret)) {
		throw new Error("AUTH_RATE_LIMIT_SECRET must contain 32 random bytes as 64 hex characters.");
	}
	return {
		origin: url.origin,
		secure,
		trustProxy,
		rateLimitKey: Buffer.from(secret, "hex"),
		cookieName: secure ? "__Host-ft_session" : "ft_session_dev",
	};
}