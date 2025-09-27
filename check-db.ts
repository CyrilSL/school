import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./src/server/db/schema";
import { eq } from "drizzle-orm";
import dotenv from "dotenv";

dotenv.config();

const { organization, member, institution, user, account } = schema;

const sql = postgres(process.env.DATABASE_URL!);
const db = drizzle(sql);

async function checkDatabase() {
  console.log("🔍 Checking database for institution inst-1...\n");

  try {
    // Get institution
    const inst = await db
      .select()
      .from(institution)
      .where(eq(institution.id, "inst-1"));

    if (inst.length === 0) {
      console.log("❌ Institution inst-1 not found");
      return;
    }

    console.log("🏫 Institution:", inst[0]!.name);
    console.log("   Organization ID:", inst[0]!.organizationId);

    // Get organization members
    const members = await db
      .select({
        userId: member.userId,
        role: member.role,
        userName: user.name,
        userEmail: user.email,
      })
      .from(member)
      .innerJoin(user, eq(member.userId, user.id))
      .where(eq(member.organizationId, inst[0]!.organizationId));

    console.log(`\n👥 Organization members (${members.length}):`);
    for (const mbr of members) {
      console.log(`   - ${mbr.userName} (${mbr.userEmail}) - Role: ${mbr.role}`);

      // Check account/password for this user
      const accounts = await db
        .select({
          id: account.id,
          providerId: account.providerId,
          password: account.password,
        })
        .from(account)
        .where(eq(account.userId, mbr.userId));

      console.log(`     Accounts: ${accounts.length}`);
      for (const acc of accounts) {
        console.log(`       - Provider: ${acc.providerId}, Has Password: ${!!acc.password}`);
        if (acc.password) {
          console.log(`       - Password length: ${acc.password.length} chars`);
          console.log(`       - Password starts with: ${acc.password.substring(0, 10)}...`);
        } else {
          console.log(`       - ❌ PASSWORD IS NULL/UNDEFINED!`);
        }
      }
    }

  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await sql.end();
  }
}

checkDatabase();