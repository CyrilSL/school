import dotenv from "dotenv";
dotenv.config();

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "../server/db/schema";
import bcrypt from "bcrypt";

const { organization, member, institution, student, user, account } = schema;

const sql = postgres(process.env.DATABASE_URL!);
const db = drizzle(sql);

const ROLES = {
  INSTITUTION_ADMIN: "admin",
  PARENT: "parent",
} as const;

async function seed() {
  console.log("🌱 Seeding database...");

  try {
    console.log("✅ Database schema ready for production data");
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    throw error;
  } finally {
    await sql.end();
  }
}

// Run seed
seed()
  .then(() => {
    console.log("Seeding complete!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Seeding failed:", error);
    process.exit(1);
  });

export { seed };