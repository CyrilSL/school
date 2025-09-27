import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "../server/db/schema";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const { organization, institution } = schema;

const sql = postgres(process.env.DATABASE_URL!);
const db = drizzle(sql);

// Sample data for 12 institutions
const institutionsData = [
  {
    name: "Delhi Public School",
    type: "school",
    locations: [
      { city: "New Delhi", state: "Delhi" },
      { city: "Gurgaon", state: "Haryana" },
      { city: "Noida", state: "Uttar Pradesh" }
    ],
    boards: ["CBSE", "ICSE"],
    website: "https://dpsdelhi.com",
    phone: "+91-11-2618-4000",
    email: "info@dpsdelhi.com"
  },
  {
    name: "Kendriya Vidyalaya",
    type: "school",
    locations: [
      { city: "Mumbai", state: "Maharashtra" },
      { city: "Pune", state: "Maharashtra" },
      { city: "Nagpur", state: "Maharashtra" }
    ],
    boards: ["CBSE"],
    website: "https://kvsangathan.nic.in",
    phone: "+91-22-2266-7890",
    email: "info@kv.edu.in"
  },
  {
    name: "Ryan International School",
    type: "school",
    locations: [
      { city: "Bangalore", state: "Karnataka" },
      { city: "Hyderabad", state: "Telangana" },
      { city: "Chennai", state: "Tamil Nadu" }
    ],
    boards: ["CBSE", "ICSE", "IB"],
    website: "https://ryangroup.org",
    phone: "+91-80-4567-8900",
    email: "admissions@ryangroup.org"
  },
  {
    name: "St. Xavier's College",
    type: "college",
    locations: [
      { city: "Mumbai", state: "Maharashtra" },
      { city: "Kolkata", state: "West Bengal" }
    ],
    boards: ["Maharashtra State Board", "West Bengal Board"],
    website: "https://xaviers.edu",
    phone: "+91-22-2661-0661",
    email: "principal@xaviers.edu"
  },
  {
    name: "Lady Shri Ram College",
    type: "college",
    locations: [
      { city: "New Delhi", state: "Delhi" }
    ],
    boards: ["Delhi University"],
    website: "https://lsr.edu.in",
    phone: "+91-11-2434-4844",
    email: "principal@lsr.edu.in"
  },
  {
    name: "Indian Institute of Technology",
    type: "university",
    locations: [
      { city: "Mumbai", state: "Maharashtra" },
      { city: "Delhi", state: "Delhi" },
      { city: "Kanpur", state: "Uttar Pradesh" },
      { city: "Chennai", state: "Tamil Nadu" },
      { city: "Kharagpur", state: "West Bengal" }
    ],
    boards: ["JEE Advanced", "GATE"],
    website: "https://iitbombay.edu.in",
    phone: "+91-22-2572-2545",
    email: "webmaster@iitb.ac.in"
  },
  {
    name: "Jawaharlal Nehru University",
    type: "university",
    locations: [
      { city: "New Delhi", state: "Delhi" }
    ],
    boards: ["UGC", "AICTE"],
    website: "https://jnu.ac.in",
    phone: "+91-11-2670-4000",
    email: "registrar@jnu.ac.in"
  },
  {
    name: "FIITJEE",
    type: "college",
    locations: [
      { city: "Delhi", state: "Delhi" },
      { city: "Mumbai", state: "Maharashtra" },
      { city: "Hyderabad", state: "Telangana" },
      { city: "Bangalore", state: "Karnataka" }
    ],
    boards: ["JEE Main", "JEE Advanced", "NEET"],
    website: "https://fiitjee.com",
    phone: "+91-11-4353-5353",
    email: "info@fiitjee.com"
  },
  {
    name: "Aakash Institute",
    type: "college",
    locations: [
      { city: "Delhi", state: "Delhi" },
      { city: "Mumbai", state: "Maharashtra" },
      { city: "Bangalore", state: "Karnataka" },
      { city: "Chennai", state: "Tamil Nadu" }
    ],
    boards: ["NEET", "JEE Main", "AIIMS"],
    website: "https://aakash.ac.in",
    phone: "+91-11-4224-4444",
    email: "info@aakash.ac.in"
  },
  {
    name: "Manipal Academy of Higher Education",
    type: "university",
    locations: [
      { city: "Manipal", state: "Karnataka" },
      { city: "Bangalore", state: "Karnataka" },
      { city: "Jaipur", state: "Rajasthan" }
    ],
    boards: ["MAHE", "AICTE", "UGC"],
    website: "https://manipal.edu",
    phone: "+91-820-292-0100",
    email: "info@manipal.edu"
  },
  {
    name: "Amity University",
    type: "university",
    locations: [
      { city: "Noida", state: "Uttar Pradesh" },
      { city: "Gurgaon", state: "Haryana" },
      { city: "Mumbai", state: "Maharashtra" },
      { city: "Jaipur", state: "Rajasthan" }
    ],
    boards: ["AICTE", "UGC", "BCI"],
    website: "https://amity.edu",
    phone: "+91-120-471-5000",
    email: "info@amity.edu"
  },
  {
    name: "Modern School",
    type: "school",
    locations: [
      { city: "Delhi", state: "Delhi" },
      { city: "Faridabad", state: "Haryana" }
    ],
    boards: ["CBSE"],
    website: "https://modernschool.net",
    phone: "+91-11-2335-8610",
    email: "principal@modernschool.net"
  }
];

async function seedInstitutions() {
  console.log("🌱 Seeding institutions...");

  try {
    // First, let's check if we have a demo organization or create one
    let demoOrg;
    try {
      // Try to find existing demo organization
      const existing = await db.select().from(organization).limit(1);
      if (existing.length > 0) {
        demoOrg = existing[0];
        console.log("✅ Using existing organization:", demoOrg.name);
      } else {
        // Create demo organization if none exists
        [demoOrg] = await db
          .insert(organization)
          .values({
            id: "demo-org-1",
            name: "Demo Educational Platform",
            slug: "demo-platform",
            createdAt: new Date(),
            updatedAt: new Date(),
          })
          .returning();
        console.log("✅ Created demo organization");
      }
    } catch (error) {
      console.error("Error with organization:", error);
      throw error;
    }

    // Insert all institutions
    for (let i = 0; i < institutionsData.length; i++) {
      const inst = institutionsData[i];

      try {
        await db.insert(institution).values({
          id: `inst-${i + 1}`,
          organizationId: demoOrg!.id,
          name: inst.name,
          type: inst.type,
          // Legacy fields for backward compatibility
          city: inst.locations[0]?.city || "Delhi",
          state: inst.locations[0]?.state || "Delhi",
          // New multi-format fields
          locations: inst.locations,
          boards: inst.boards,
          website: inst.website,
          phone: inst.phone,
          email: inst.email,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        });

        console.log(`✅ Created institution: ${inst.name} (${inst.locations.length} locations, ${inst.boards.length} boards)`);
      } catch (error) {
        console.error(`❌ Error creating institution ${inst.name}:`, error);
        // Continue with other institutions even if one fails
      }
    }

    console.log("🎉 Institution seeding completed!");
    console.log(`📊 Summary: ${institutionsData.length} institutions with multiple locations and boards`);

  } catch (error) {
    console.error("❌ Error seeding institutions:", error);
    throw error;
  } finally {
    await sql.end();
  }
}

// Run seed
seedInstitutions()
  .then(() => {
    console.log("Institution seeding complete!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Institution seeding failed:", error);
    process.exit(1);
  });

export { seedInstitutions };