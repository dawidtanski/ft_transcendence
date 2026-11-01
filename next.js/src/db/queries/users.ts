import "server-only"

import { db } from "@/lib/db";
import { usersTable } from "../schema";
import {desc, asc} from "drizzle-orm";
import { use } from "react";


export async function getBestUsers(){
	return db.select({
		id:usersTable.id,
		nickname:usersTable.nickname,
		points: usersTable.points,
	})
	.from(usersTable)
	.orderBy(desc(usersTable.points), asc(usersTable.id))
	.limit(5);
}