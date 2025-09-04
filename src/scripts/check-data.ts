import dotenv from "dotenv";
dotenv.config();

import { drizzle } from "drizzle-orm/postgres-js";
import { eq } from "drizzle-orm";
import postgres from "postgres";
import * as schema from "../server/db/schema";

const { user, account } = schema;

const sql = postgres(process.env.DATABASE_URL!);
const db = drizzle(sql);

async function checkData() {
  console.log("🔍 Checking database data...");

  try {
    // Check users
    const users = await db.select().from(user);
    console.log("👥 Users:", users.map(u => ({ id: u.id, email: u.email, name: u.name })));

    // Check accounts
    const accounts = await db.select().from(account);
    console.log("🔑 Accounts:", accounts.map(a => ({ 
      id: a.id, 
      userId: a.userId, 
      providerId: a.providerId,
      hasPassword: !!a.password,
      passwordLength: a.password?.length
    })));

    // Check specific account for parent
    const parentAccounts = await db.select().from(account).where(eq(account.accountId, "parent@example.com"));
    console.log("🧾 Parent accounts:", parentAccounts);

  } catch (error) {
    console.error("❌ Error checking data:", error);
  } finally {
    await sql.end();
  }
}

checkData();