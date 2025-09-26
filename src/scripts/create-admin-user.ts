import dotenv from "dotenv";
import { auth } from "~/server/auth";

dotenv.config();

async function createAdminUser() {
  console.log("🌱 Creating admin user...");

  const adminEmail = "admin@myfee.com";
  const adminPassword = "admin123";
  const adminName = "System Admin";

  try {
    console.log("Creating admin user via Better Auth admin API...");

    // Use better-auth admin.createUser API
    const newUser = await auth.api.createUser({
      body: {
        email: adminEmail,
        password: adminPassword,
        name: adminName,
        role: "admin"
      }
    });

    if (newUser) {
      console.log("✅ Admin user created successfully!");
      console.log(`🔑 Login with: ${adminEmail} / ${adminPassword}`);
      console.log(`🔗 Admin panel: http://localhost:3001/admin`);
    }

  } catch (error: any) {
    if (error.message?.includes("already exists") || error.message?.includes("unique")) {
      console.log("⚠️ Admin user already exists!");
      console.log(`🔑 Login with: ${adminEmail} / ${adminPassword}`);
      console.log(`🔗 Admin panel: http://localhost:3001/admin`);
    } else {
      console.error("❌ Error creating admin user:", error.message || error);
    }
  }
}

createAdminUser();