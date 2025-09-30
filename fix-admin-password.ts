import "dotenv/config";
import { auth } from "./src/server/auth";

async function fixAdminPassword() {
  console.log("Fixing admin password...");

  try {
    // Try to sign in first to verify current state
    const signInResult = await auth.api.signInEmail({
      body: {
        email: "admin@myfee.com",
        password: "admin123",
      },
    });

    console.log("✅ Login works! No fix needed.");
    console.log("Result:", signInResult);
  } catch (error: any) {
    console.log("❌ Login failed:", error.message);
    console.log("\nAttempting to update user with Better Auth API...");

    // Try updating the user
    try {
      const updateResult = await auth.api.updateUser({
        body: {
          email: "admin@myfee.com",
          password: "admin123",
        },
      });
      console.log("✅ User updated:", updateResult);
    } catch (updateError: any) {
      console.log("❌ Update failed:", updateError.message);
    }
  }

  process.exit(0);
}

fixAdminPassword();
