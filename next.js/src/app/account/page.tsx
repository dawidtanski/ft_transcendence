import { requireUser } from "@/lib/auth/session";
import LogoutButton from "@/components/auth/LogoutButton";
import styles from "@/components/auth/auth.module.css";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function AccountPage() {
	const user = await requireUser(); // Server check before rendering private information.
	return <main className={styles.account}>
		<h1>Hello, {user.nickname}</h1>
		<p>This page is a protected login integration example.</p>
		<dl>
		<dt>Application user ID</dt><dd>{user.id}</dd>
		<dt>Email</dt><dd>{user.email}</dd>
		<dt>Points</dt><dd>{user.points}</dd>
		</dl>
		<LogoutButton />
	</main>;
}