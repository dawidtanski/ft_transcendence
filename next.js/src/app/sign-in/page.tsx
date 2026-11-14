// export default function LoginPage() {
//   return (
// 		<>
			
// 			<main>
				
// 			</main>
// 		</>
//   );
// }

// Merge into next.js/src/app/sign-in/page.tsx.
// This is a minimal example, NOT a requirement to delete your existing layout
// or your friend's Google button. PasswordLoginForm can instead be rendered
// inside the existing LoginPage.tsx component.
import PasswordLoginForm from "@/components/auth/PasswordLoginForm";
import { getCurrentUser } from "@/lib/auth/session";
import { redirect } from "next/navigation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function SignInPage() {
	if (await getCurrentUser()) redirect("/account");
	return <main>
		<h1>Sign in</h1>
		<PasswordLoginForm />
		{/* Keep/add your friend's existing OAuth component here. */}
	</main>;
}