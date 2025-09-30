import "dotenv/config";
import { db } from "./src/server/db";
import { user, account } from "./src/server/db/schema";
import { eq } from "drizzle-orm";

async function recreateAdmin() {
  console.log("🗑️  Deleting old admin user and account...");

  // Delete account first (foreign key constraint)
  await db.delete(account).where(eq(account.accountId, "admin@myfee.com"));

  // Delete user
  await db.delete(user).where(eq(user.email, "admin@myfee.com"));

  console.log("✅ Old admin deleted\n");

  console.log("🔄 Creating new admin user via Better Auth API...");

  const { auth } = await import("./src/server/auth");

  try {
    const newUser = await auth.api.signUpEmail({
      body: {
        email: "admin@myfee.com",
        password: "admin123",
        name: "System Admin",
      },
    });

    console.log("✅ User created via signUpEmail:", newUser);

    // Now set role to admin
    const adminUserId = newUser?.user?.id;
    if (adminUserId) {
      await db.update(user).set({ role: "admin", emailVerified: true }).where(eq(user.id, adminUserId));
      console.log("✅ User role set to admin");
    }

    console.log("\n✅ Admin user recreated successfully!");
    console.log("Email: admin@myfee.com");
    console.log("Password: admin123");
  } catch (error: any) {
    console.error("❌ Error:", error.message || error);
  }

  process.exit(0);
}

recreateAdmin();
