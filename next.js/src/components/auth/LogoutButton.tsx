"use client";
import { useState } from "react";

export default function LogoutButton() {
	const [pending, setPending] = useState(false);
	const [error, setError] = useState("");
	async function logout() {
		setPending(true);
		setError("");
		try {
		const response = await fetch("/api/auth/logout", {
			method: "POST", credentials: "same-origin", cache: "no-store",
			headers: { "Content-Type": "application/json" }, body: "{}",
		});
		if (!response.ok) throw new Error("Logout failed");
		window.location.replace("/sign-in");
		} catch {
		// Do not pretend the server session ended if the request failed.
		setError("Could not sign out. Please try again.");
		setPending(false);
		}
	}
	return <div>
		<button type="button" onClick={logout} disabled={pending}>
		{pending ? "Signing out…" : "Sign out"}
		</button>
		{error && <p role="alert">{error}</p>}
	</div>;
}