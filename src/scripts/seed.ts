import dotenv from "dotenv";
dotenv.config();

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "../server/db/schema";
import bcrypt from "bcrypt";

const { organization, member, institution, student, user, account } = schema;

const sql = postgres(process.env.DATABASE_URL!);
const db = drizzle(sql);

const ROLES = {
  INSTITUTION_ADMIN: "admin",
  PARENT: "parent",
} as const;

async function seed() {
  console.log("🌱 Seeding database...");

  try {
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

    // Hash passwords
    const adminPasswordHash = await bcrypt.hash("admin123", 10);
    const parentPasswordHash = await bcrypt.hash("parent123", 10);

    // Create institution admin user
    const [adminUser] = await db
      .insert(user)
      .values({
        id: "admin-user-1",
        name: "Institution Admin",
        email: "admin@school.edu",
        emailVerified: true,
        isPremium: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    // Create admin account for password
    await db.insert(account).values({
      id: "admin-account-1",
      accountId: "admin@school.edu",
      providerId: "credential",
      userId: adminUser.id,
      password: adminPasswordHash,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Add admin to organization
    await db.insert(member).values({
      id: "member-admin-1",
      organizationId: demoOrg!.id,
      userId: adminUser.id,
      role: ROLES.INSTITUTION_ADMIN,
      createdAt: new Date(),
    });

    console.log("✅ Created institution admin user and membership");

    // Create parent user
    const [parentUser] = await db
      .insert(user)
      .values({
        id: "parent-user-1",
        name: "Parent User",
        email: "parent@example.com",
        emailVerified: true,
        isPremium: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    // Create parent account for password
    await db.insert(account).values({
      id: "parent-account-1",
      accountId: "parent@example.com",
      providerId: "credential",
      userId: parentUser.id,
      password: parentPasswordHash,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Add parent to organization
    await db.insert(member).values({
      id: "member-parent-1",
      organizationId: demoOrg!.id,
      userId: parentUser.id,
      role: ROLES.PARENT,
      createdAt: new Date(),
    });

    console.log("✅ Created parent user and membership");

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

    console.log("✅ Created institution record");

    // Create demo student
    await db.insert(student).values({
      id: "student-1",
      parentId: parentUser.id,
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

    console.log("✅ Created demo student");

    console.log("🎉 Database seeded successfully!");
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    throw error;
  } finally {
    await sql.end();
  }
}

// Run seed
seed()
  .then(() => {
    console.log("Seeding complete!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Seeding failed:", error);
    process.exit(1);
  });

export { seed };