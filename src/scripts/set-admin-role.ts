import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { user } from "~/server/db/schema";
import { eq } from "drizzle-orm";
import { env } from "~/env";

const sql = postgres(env.DATABASE_URL);
const db = drizzle(sql);

async function setAdminRole() {
  console.log("🔧 Setting admin role for admin@myfee.com...");

  try {
    const result = await db.update(user)
      .set({ role: "admin" })
      .where(eq(user.email, "admin@myfee.com"))
      .returning();

    if (result.length > 0) {
      console.log("✅ Admin role set successfully!");
      console.log(`📧 User: ${result[0].email}`);
      console.log(`👤 Name: ${result[0].name}`);
      console.log(`🔑 Role: ${result[0].role}`);
      console.log("");
      console.log("🎉 Admin user is ready!");
      console.log("🔗 Login at: http://localhost:3001/login");
      console.log("📧 Email: admin@myfee.com");
      console.log("🔒 Password: admin123");
    } else {
      console.log("❌ No user found with email admin@myfee.com");
    }

  } catch (error) {
    console.error("❌ Error setting admin role:", error);
  } finally {
    await sql.end();
  }
}

setAdminRole();