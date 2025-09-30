import "dotenv/config";
import { db } from "./src/server/db";
import { user, account } from "./src/server/db/schema";
import { eq } from "drizzle-orm";

async function checkAdmin() {
  console.log("Checking admin user...");

  const adminUser = await db
    .select()
    .from(user)
    .where(eq(user.email, "admin@myfee.com"));

  console.log("Admin user:", adminUser);

  if (adminUser.length > 0) {
    const adminAccount = await db
      .select()
      .from(account)
      .where(eq(account.userId, adminUser[0].id));

    console.log("Admin account:", adminAccount);
    console.log("\nPassword field type:", typeof adminAccount[0]?.password);
    console.log("Password value:", adminAccount[0]?.password);
    console.log("Password is null?", adminAccount[0]?.password === null);
    console.log("Password is undefined?", adminAccount[0]?.password === undefined);

    // Check credential provider account specifically
    const credentialAccount = await db
      .select()
      .from(account)
      .where(eq(account.userId, adminUser[0].id))
      .where(eq(account.providerId, "credential"));

    console.log("\nCredential account:", credentialAccount);
  }

  process.exit(0);
}

checkAdmin();
