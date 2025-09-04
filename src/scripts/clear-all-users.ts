import dotenv from "dotenv";
dotenv.config();

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "../server/db/schema";

const { user, account, member, student, institution, organization } = schema;

const sql = postgres(process.env.DATABASE_URL!);
const db = drizzle(sql);

async function clearAllUsers() {
  console.log("🗑️ Clearing all user data...");

  try {
    // Delete in correct order to respect foreign keys
    await db.delete(student);
    await db.delete(institution);
    await db.delete(member);
    await db.delete(account);
    await db.delete(user);
    await db.delete(organization);

    console.log("✅ All user data cleared");
    console.log("");
    console.log("📝 Database is now clean - ready for fresh setup!");
  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await sql.end();
  }
}

clearAllUsers();