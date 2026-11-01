import { db } from "@/lib/db";
import { users } from "@/db/schema";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await db.select({ id: users.id }).from(users).limit(1);

    return Response.json({ ok: true });
  } catch (error) {
    console.error("Database test failed:", error);

    return Response.json({ ok: false }, { status: 500 });
  }
}