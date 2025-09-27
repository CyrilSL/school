import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./src/server/db/schema";
import { eq } from "drizzle-orm";
import dotenv from "dotenv";

dotenv.config();

const { user, account } = schema;

const sql = postgres(process.env.DATABASE_URL!);
const db = drizzle(sql);

async function debugAuth() {
  console.log("🔍 Debugging auth for info@dpsdelhi.com...\n");

  try {
    // Find user by email
    const users = await db
      .select()
      .from(user)
      .where(eq(user.email, "info@dpsdelhi.com"));

    if (users.length === 0) {
      console.log("❌ No user found with email info@dpsdelhi.com");
      return;
    }

    const userRecord = users[0]!;
    console.log("👤 User found:");
    console.log("   ID:", userRecord.id);
    console.log("   Name:", userRecord.name);
    console.log("   Email:", userRecord.email);
    console.log("   Role:", userRecord.role);
    console.log("   Email Verified:", userRecord.emailVerified);

    // Find all accounts for this user
    const accounts = await db
      .select()
      .from(account)
      .where(eq(account.userId, userRecord.id));

    console.log(`\n🔐 Accounts for user (${accounts.length}):`);
    for (const acc of accounts) {
      console.log(`   Account ID: ${acc.id}`);
      console.log(`   Provider: ${acc.providerId}`);
      console.log(`   Account ID: ${acc.accountId}`);
      console.log(`   Has Password: ${!!acc.password}`);

      if (acc.password) {
        console.log(`   Password length: ${acc.password.length}`);
        console.log(`   Password type: ${typeof acc.password}`);
        console.log(`   Password starts: ${acc.password.substring(0, 20)}...`);
        console.log(`   Is string: ${typeof acc.password === 'string'}`);
        console.log(`   Is buffer: ${Buffer.isBuffer(acc.password)}`);
      } else {
        console.log(`   ❌ PASSWORD IS: ${acc.password}`);
      }
      console.log(`   Created: ${acc.createdAt}`);
      console.log(`   Updated: ${acc.updatedAt}`);
      console.log("   ---");
    }

  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await sql.end();
  }
}

debugAuth();