#!/usr/bin/env tsx

/**
 * Migration script to convert institutions from legacy format to new multi-location/board format
 *
 * Usage: tsx src/scripts/migrate-institutions.ts
 */

import { db } from "~/server/db";
import { institution } from "~/server/db/schema";
import { eq } from "drizzle-orm";

async function migrateInstitutions() {
  console.log("Starting institution migration...");

  try {
    // Get all institutions with legacy data
    const allInstitutions = await db.select({
      id: institution.id,
      name: institution.name,
      type: institution.type,
      city: institution.city,
      state: institution.state,
      board: institution.board,
      locations: institution.locations,
      boards: institution.boards,
    }).from(institution);

    console.log(`Found ${allInstitutions.length} institutions to check`);

    let migratedCount = 0;

    for (const inst of allInstitutions) {
      let needsUpdate = false;
      const updateData: any = {};

      // Convert legacy location to new locations array format
      if (inst.city && (!inst.locations || inst.locations.length === 0)) {
        updateData.locations = [
          {
            city: inst.city,
            state: inst.state || undefined,
            address: undefined
          }
        ];
        needsUpdate = true;
        console.log(`- Converting location for ${inst.name}: ${inst.city}${inst.state ? ', ' + inst.state : ''}`);
      }

      // Convert legacy board to new boards array format
      if (inst.board && (!inst.boards || inst.boards.length === 0)) {
        updateData.boards = [inst.board];
        needsUpdate = true;
        console.log(`- Converting board for ${inst.name}: ${inst.board}`);
      }

      // Update the institution if needed
      if (needsUpdate) {
        await db.update(institution)
          .set(updateData)
          .where(eq(institution.id, inst.id));

        migratedCount++;
        console.log(`✅ Migrated ${inst.name}`);
      } else {
        console.log(`⏭️  ${inst.name} already in new format`);
      }
    }

    console.log(`\n✅ Migration completed! Migrated ${migratedCount} institutions.`);

    // Show final state
    console.log("\nFinal institution state:");
    const finalInstitutions = await db.select({
      id: institution.id,
      name: institution.name,
      locations: institution.locations,
      boards: institution.boards,
    }).from(institution);

    finalInstitutions.forEach(inst => {
      console.log(`- ${inst.name}:`);
      console.log(`  Locations: ${JSON.stringify(inst.locations)}`);
      console.log(`  Boards: ${JSON.stringify(inst.boards)}`);
    });

  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }
}

// Run the migration
migrateInstitutions().then(() => {
  console.log("Migration script completed successfully!");
  process.exit(0);
}).catch((error) => {
  console.error("Migration script failed:", error);
  process.exit(1);
});