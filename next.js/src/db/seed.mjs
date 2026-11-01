import { randomBytes, randomInt, scryptSync } from "node:crypto";
import { readFileSync } from "node:fs";
import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { usersTable } from "./schema.ts";

// Node 24 (used by our Docker image) can load schema.ts directly.
const names = ["Anna", "Jan", "Ola", "Adam", "Ewa", "Piotr", "Julia"];
const surnames = ["Nowak", "Kowalski", "Mazur", "Wojcik", "Krawczyk"];
const pick = (values) => values[randomInt(values.length)];

const users = Array.from({ length: 5 }, (_, index) => {
  const name = pick(names);
  const nickname = `seed_${name.toLowerCase()}_${randomBytes(4).toString("hex")}`;
  const salt = randomBytes(16).toString("hex");
  // Random, undisclosed passwords: these are display fixtures, not login accounts.
  const hash = scryptSync(randomBytes(32), salt, 64).toString("hex");

  return {
    nickname,
    name,
    surName: pick(surnames),
    // Stable seed emails prevent duplicates on subsequent runs.
    email: `leaderboard-seed-${index + 1}@example.test`,
    age: randomInt(18, 81),
    avatarURL: `https://api.dicebear.com/10.x/lorelei/svg?seed=${nickname}`,
    password_hash: `scrypt$${salt}$${hash}`,
    points: randomInt(0, 1001),
  };
});

if (process.argv.includes("--dry-run")) {
  console.table(users.map(({ password_hash, ...user }) => user));
} else {
  const pool = new Pool({
    max: 1,
    connectionTimeoutMillis: 5000,
    ssl: process.env.PGSSLROOTCERT
      ? { ca: readFileSync(process.env.PGSSLROOTCERT, "utf8"), rejectUnauthorized: true }
      : false,
  });

  try {
    const db = drizzle(pool);
    const inserted = await db.insert(usersTable)
      .values(users)
      .onConflictDoNothing({ target: usersTable.email })
      .returning({ id: usersTable.id, nickname: usersTable.nickname, points: usersTable.points });

    console.table(inserted);
    console.log(`Added ${inserted.length} users; skipped ${5 - inserted.length} existing seed users.`);
  } catch (error) {
    console.error("Seed failed:", error);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}
