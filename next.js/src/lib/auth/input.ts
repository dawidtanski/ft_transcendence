export type LoginInput = { email: string; password: string };

export function normalizeEmail(email: string): string {
	return email.trim().toLowerCase();
}

export function parseLoginInput(value: unknown): LoginInput | null {
	if (typeof value !== "object" || value === null || Array.isArray(value)) return null;
	const data = value as Record<string, unknown>;
	if (typeof data.email !== "string" || typeof data.password !== "string") return null;
	if (data.email.length > 512) return null;
	const email = normalizeEmail(data.email);
	if (email.length > 255 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return null;

	if (data.password.length < 1 || data.password.length > 256 ||
		Array.from(data.password).length > 128) return null;
	return { email, password: data.password };
}

export function isAcceptableNewPassword(password: string): boolean {
	const length = Array.from(password).length;
	return length >= 15 && length <= 128;
}