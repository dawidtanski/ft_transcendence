import "server-only";

import { db } from "@/lib/db";
import { usersTable } from "../schema";
import { asc, desc } from "drizzle-orm";

export async function getBestUsers() {
  try {
    return await db
      .select({
        id: usersTable.id,
        nickname: usersTable.nickname,
        points: usersTable.points,
      })
      .from(usersTable)
      .orderBy(desc(usersTable.points), asc(usersTable.id))
      .limit(5);
  } catch (error) {
    console.warn("Leaderboard query failed, returning empty dataset:", error);
    return [];
  }
}