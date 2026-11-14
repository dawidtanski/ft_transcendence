import "server-only";
import { argon2id, hash, verify } from "argon2";
import { isAcceptableNewPassword } from "./input";

const options = {
	type: argon2id,
	memoryCost: 19 * 1024, // KiB: OWASP's 19 MiB minimum configuration.
	timeCost: 2,
	parallelism: 1,
	hashLength: 32,
};

// A valid Argon2id hash with the same work factors, but not a real user.
const DUMMY_HASH = "$argon2id$v=19$m=19456,t=2,p=1$wRVcZVq/Dkk1Ocurf7wB+A$++oeTtHuygMN7wtPbDLTYN9k/pnnbm+aBo9Gbuk+DMk";

export async function hashNewPassword(password: string): Promise<string> {
	if (!isAcceptableNewPassword(password)) {
		throw new Error("New passwords must contain 15-128 characters.");
	}
	// The library generates a fresh random salt for every password.
	return hash(password, options);
}

export async function verifyPassword(
	storedHash: string | null | undefined,
	password: string,
): Promise<boolean> {
	const supported = typeof storedHash === "string" && storedHash.startsWith("$argon2id$");
	try {
		const matched = await verify(supported ? storedHash : DUMMY_HASH, password);
		// Never authenticate an account without a supported password credential.
		return supported && matched;
	} catch {
		// Malformed stored hashes fail closed. Do not print hashes/passwords.
		await verify(DUMMY_HASH, password);
		return false;
	}
}