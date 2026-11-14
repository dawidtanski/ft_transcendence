"use client";

import { useRef, useState, type FormEvent } from "react";
import styles from "./auth.module.css";

export default function PasswordLoginForm() {
	const [error, setError] = useState("");
	const [pending, setPending] = useState(false);
	const submitting = useRef(false);

	async function handleSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		if (submitting.current) return;
		const form = event.currentTarget;
		const data = new FormData(form);
		submitting.current = true;
		setPending(true);
		setError("");
		try {
		const response = await fetch("/api/auth/login", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			credentials: "same-origin",
			cache: "no-store",
			body: JSON.stringify({ email: data.get("email"), password: data.get("password") }),
		});
		if (!response.ok) {
			setError(response.status === 429 ? "Too many attempts. Please try again later."
			: response.status === 401 ? "Invalid email or password."
			: response.status === 400 ? "Enter a valid email and password."
			: "Sign-in is unavailable. Please try again.");
			return;
		}
		form.reset();
		// Full navigation avoids retaining stale authenticated/anonymous UI state.
		window.location.replace("/account");
		} catch {
		setError("Could not reach the server. Check your connection and try again.");
		} finally {
		submitting.current = false;
		setPending(false);
		}
	}

	return (
		<form className={styles.form} onSubmit={handleSubmit} aria-busy={pending}>
		<fieldset className={styles.fields} disabled={pending}>
			<legend>Sign in with your password</legend>
			<label htmlFor="password-login-email">Email</label>
			<input id="password-login-email" name="email" type="email"
			autoComplete="username" autoCapitalize="none" spellCheck={false}
			required maxLength={255} />
			<label htmlFor="password-login-password">Password</label>
			<input id="password-login-password" name="password" type="password"
			autoComplete="current-password" required maxLength={256} />
			<button type="submit">{pending ? "Signing in…" : "Sign in"}</button>
		</fieldset>
		<p className={styles.message} role="alert" aria-live="polite">{error}</p>
		</form>
	);
}