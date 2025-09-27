import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "../server/db/schema";
import { eq } from "drizzle-orm";
import dotenv from "dotenv";

dotenv.config();

const { organization, member, institution, user } = schema;

const sql = postgres(process.env.DATABASE_URL!);
const db = drizzle(sql);

async function checkInstitutions() {
  console.log("🔍 Checking institution-login linkage...\n");

  try {
    // 1. Get all institutions from database
    const institutions = await db
      .select()
      .from(institution)
      .orderBy(institution.createdAt);

    console.log(`📊 Found ${institutions.length} institutions in database:`);

    for (const inst of institutions) {
      console.log(`\n🏫 Institution: ${inst.name}`);
      console.log(`   ID: ${inst.id}`);
      console.log(`   Type: ${inst.type}`);
      console.log(`   Organization ID: ${inst.organizationId}`);
      console.log(`   Active: ${inst.isActive}`);
      console.log(`   Locations: ${JSON.stringify(inst.locations)}`);
      console.log(`   Boards: ${JSON.stringify(inst.boards)}`);

      // Check if organization exists
      const org = await db
        .select()
        .from(organization)
        .where(eq(organization.id, inst.organizationId));

      if (org.length > 0) {
        console.log(`   ✅ Organization exists: ${org[0]!.name}`);

        // Check if there are any users (admins) linked to this organization
        const orgMembers = await db
          .select({
            userId: member.userId,
            role: member.role,
            userName: user.name,
            userEmail: user.email,
          })
          .from(member)
          .innerJoin(user, eq(member.userId, user.id))
          .where(eq(member.organizationId, inst.organizationId));

        if (orgMembers.length > 0) {
          console.log(`   👥 Organization members (${orgMembers.length}):`);
          for (const mbr of orgMembers) {
            console.log(`      - ${mbr.userName} (${mbr.userEmail}) - Role: ${mbr.role}`);
          }
          console.log(`   ✅ LOGIN ENABLED - Institution has admin users`);
        } else {
          console.log(`   ❌ NO LOGIN - No admin users found for this institution`);
        }
      } else {
        console.log(`   ❌ Organization not found - Invalid organizationId`);
      }
    }

    console.log(`\n📈 Summary:`);
    console.log(`Total institutions: ${institutions.length}`);

    let loginEnabled = 0;
    let noLogin = 0;

    for (const inst of institutions) {
      const orgMembers = await db
        .select()
        .from(member)
        .where(eq(member.organizationId, inst.organizationId));

      if (orgMembers.length > 0) {
        loginEnabled++;
      } else {
        noLogin++;
      }
    }

    console.log(`Institutions with login enabled: ${loginEnabled}`);
    console.log(`Institutions without login: ${noLogin}`);

  } catch (error) {
    console.error("❌ Error checking institutions:", error);
    throw error;
  } finally {
    await sql.end();
  }
}

checkInstitutions()
  .then(() => {
    console.log("\n✅ Check complete!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Check failed:", error);
    process.exit(1);
  });