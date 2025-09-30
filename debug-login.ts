import "dotenv/config";
import { db } from "./src/server/db";
import { user, account } from "./src/server/db/schema";
import { eq, and } from "drizzle-orm";

async function debugLogin() {
  console.log("🔍 DEBUG: Testing login flow manually...\n");

  const email = "admin@myfee.com";

  // Step 1: Find user
  console.log("Step 1: Looking up user by email...");
  const users = await db.select().from(user).where(eq(user.email, email));
  console.log("User found:", JSON.stringify(users, null, 2));

  if (users.length === 0) {
    console.log("❌ No user found!");
    process.exit(1);
  }

  const foundUser = users[0];

  // Step 2: Find account with password
  console.log("\nStep 2: Looking up account for user...");
  const accounts = await db
    .select()
    .from(account)
    .where(
      and(
        eq(account.userId, foundUser.id),
        eq(account.providerId, "credential")
      )
    );

  console.log("Accounts found:", accounts.length);
  console.log("Account details:", JSON.stringify(accounts, null, 2));

  if (accounts.length > 0) {
    const acc = accounts[0];
    console.log("\n📋 Account Summary:");
    console.log("  - ID:", acc.id);
    console.log("  - Provider ID:", acc.providerId);
    console.log("  - Account ID:", acc.accountId);
    console.log("  - Password exists:", !!acc.password);
    console.log("  - Password type:", typeof acc.password);
    console.log("  - Password value:", acc.password);
    console.log("  - Password length:", acc.password?.length);
  } else {
    console.log("❌ No credential account found!");
  }

  process.exit(0);
}

debugLogin();
