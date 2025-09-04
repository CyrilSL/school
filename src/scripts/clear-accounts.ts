import dotenv from "dotenv";
dotenv.config();

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "../server/db/schema";

const { account } = schema;

const sql = postgres(process.env.DATABASE_URL!);
const db = drizzle(sql);

async function clearAccounts() {
  console.log("🗑️ Clearing account records...");

  try {
    await db.delete(account);
    console.log("✅ All account records cleared");
    console.log("");
    console.log("📝 Now you can sign up fresh with:");
    console.log("- admin@school.edu / admin123");
    console.log("- parent@example.com / parent123");
  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await sql.end();
  }
}

clearAccounts();