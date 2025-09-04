import dotenv from "dotenv";
dotenv.config();

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { eq } from "drizzle-orm";
import * as schema from "../server/db/schema";

const { organization, member, institution, student, user, account } = schema;

const sql = postgres(process.env.DATABASE_URL!);
const db = drizzle(sql);

const ROLES = {
  INSTITUTION_ADMIN: "admin",
  PARENT: "parent",
} as const;

async function createUsersWithBetterAuth() {
  console.log("🌱 Creating demo users with Better Auth API...");

  try {
    // First, clear existing data
    await db.delete(student).where(eq(student.id, "student-1"));
    await db.delete(institution).where(eq(institution.id, "inst-1"));
    await db.delete(member).where(eq(member.organizationId, "demo-org-1"));
    await db.delete(account);
    await db.delete(user);
    await db.delete(organization).where(eq(organization.id, "demo-org-1"));

    console.log("✅ Cleared existing data");

    // Create demo organization
    const [demoOrg] = await db
      .insert(organization)
      .values({
        id: "demo-org-1",
        name: "Demo Educational Institution",
        slug: "demo-institution",
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    console.log("✅ Created demo organization");

    // Create users manually with simple user/account structure
    const adminUserId = "admin-user-1";
    const parentUserId = "parent-user-1";

    // Create admin user
    await db.insert(user).values({
      id: adminUserId,
      name: "Institution Admin",
      email: "admin@school.edu",
      emailVerified: true,
      isPremium: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Create parent user  
    await db.insert(user).values({
      id: parentUserId,
      name: "Parent User",
      email: "parent@example.com",
      emailVerified: true,
      isPremium: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    console.log("✅ Created users");

    // Add to organization
    await db.insert(member).values({
      id: "member-admin-1",
      organizationId: demoOrg!.id,
      userId: adminUserId,
      role: ROLES.INSTITUTION_ADMIN,
      createdAt: new Date(),
    });

    await db.insert(member).values({
      id: "member-parent-1",
      organizationId: demoOrg!.id,
      userId: parentUserId,
      role: ROLES.PARENT,
      createdAt: new Date(),
    });

    console.log("✅ Added users to organization");

    // Create institution record
    const [institutionRecord] = await db
      .insert(institution)
      .values({
        id: "inst-1",
        organizationId: demoOrg!.id,
        name: "Demo Public School",
        type: "school",
        address: "123 Education Street, Learning City",
        phone: "+1-555-0123",
        email: "info@demoschool.edu",
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    // Create demo student
    await db.insert(student).values({
      id: "student-1",
      parentId: parentUserId,
      institutionId: institutionRecord!.id,
      name: "Alex Johnson",
      rollNumber: "2024001",
      class: "Class 10",
      section: "A",
      admissionDate: new Date("2024-01-15"),
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    console.log("✅ Created institution and student");
    console.log("🎉 Setup complete!");
    console.log("");
    console.log("📝 Next steps:");
    console.log("1. Go to http://localhost:3002");
    console.log("2. Click 'Sign Up' and create accounts with these emails:");
    console.log("   - admin@school.edu (password: admin123)");
    console.log("   - parent@example.com (password: parent123)");
    console.log("3. The organization membership is already set up");

  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await sql.end();
  }
}

createUsersWithBetterAuth();