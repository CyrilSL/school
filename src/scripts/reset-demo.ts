import dotenv from "dotenv";
dotenv.config();

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { eq } from "drizzle-orm";
import * as schema from "../server/db/schema";

const { organization, member, institution, student, user, account } = schema;

const sql = postgres(process.env.DATABASE_URL!);
const db = drizzle(sql);

async function resetDemo() {
  console.log("🗑️ Clearing existing demo data...");

  try {
    // Delete in reverse order to respect foreign keys
    await db.delete(student).where(eq(student.id, "student-1"));
    await db.delete(institution).where(eq(institution.id, "inst-1"));
    await db.delete(member).where(eq(member.organizationId, "demo-org-1"));
    await db.delete(account).where(eq(account.userId, "admin-user-1"));
    await db.delete(account).where(eq(account.userId, "parent-user-1"));
    await db.delete(user).where(eq(user.id, "admin-user-1"));
    await db.delete(user).where(eq(user.id, "parent-user-1"));
    await db.delete(organization).where(eq(organization.id, "demo-org-1"));

    console.log("✅ Cleared existing demo data");
  } catch (error) {
    console.log("⚠️ No existing data to clear or error:", error);
  } finally {
    await sql.end();
  }
}

resetDemo()
  .then(() => {
    console.log("Reset complete!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Reset failed:", error);
    process.exit(1);
  });