import { NextRequest, NextResponse } from "next/server";
import { db } from "~/server/db";
import { institution } from "~/server/db/schema";
import { eq } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const institutionName = searchParams.get('institutionName');

    // Base query - get all institutions with new multi-format fields only
    const allInstitutions = await db.select({
      id: institution.id,
      name: institution.name,
      type: institution.type,
      boards: institution.boards, // Multi-board field
      locations: institution.locations, // Multi-location field
      website: institution.website,
      isActive: institution.isActive,
    }).from(institution);

    // Filter active institutions
    const activeInstitutions = allInstitutions.filter(inst => inst.isActive);

    // If specific institution is requested, return its locations and boards
    if (institutionName) {
      const institutionRecords = activeInstitutions.filter(inst =>
        inst.name.toLowerCase() === institutionName.toLowerCase()
      );

      if (institutionRecords.length === 0) {
        return NextResponse.json({
          success: true,
          locations: [],
          boards: []
        });
      }

      // Use the first record to get institution-level data
      const institutionData = institutionRecords[0];
      console.log(`[API] Raw institution data for "${institutionName}":`, institutionData);

      // Build locations from multi-location format (objects only)
      console.log(`[API] Raw locations field:`, institutionData.locations);
      const locations = (institutionData.locations || []).map((loc, index) => {
        console.log(`[API] Processing location ${index}:`, loc);

        const processedLocation = {
          id: `${institutionData.id}-${index}`,
          city: loc.city,
          state: loc.state || null,
          location: `${loc.city}${loc.state ? `, ${loc.state}` : ''}`,
          board: null, // Boards are no longer tied to specific locations
          type: institutionData.type
        };

        console.log(`[API] Processed location result:`, processedLocation);
        return processedLocation;
      });

      // Get boards from multi-board format
      console.log(`[API] Raw boards field:`, institutionData.boards);
      const boards = institutionData.boards || [];

      console.log(`[API] Final processed locations:`, locations);
      console.log(`[API] Final processed boards:`, boards);

      return NextResponse.json({
        success: true,
        locations,
        boards
      });
    }

    // Group institutions by name for initial dropdown
    const institutionsByName = new Map();
    activeInstitutions.forEach(inst => {
      if (!institutionsByName.has(inst.name)) {
        institutionsByName.set(inst.name, {
          name: inst.name,
          type: inst.type,
          campusCount: 0,
          cities: new Set(),
          boards: new Set()
        });
      }
      const group = institutionsByName.get(inst.name);
      group.campusCount++;

      // Handle cities from multi-location format
      if (inst.locations && Array.isArray(inst.locations)) {
        inst.locations.forEach(loc => group.cities.add(loc.city));
      }

      // Handle boards from multi-board format
      if (inst.boards && Array.isArray(inst.boards)) {
        inst.boards.forEach(board => group.boards.add(board));
      }
    });

    // Convert to array and format
    const groupedInstitutions = Array.from(institutionsByName.values()).map(group => ({
      name: group.name,
      type: group.type,
      campusCount: group.campusCount,
      cities: Array.from(group.cities),
      boards: Array.from(group.boards)
    })).sort((a, b) => a.name.localeCompare(b.name));

    return NextResponse.json({
      success: true,
      institutions: groupedInstitutions
    });

  } catch (error) {
    console.error("Error fetching institutions:", error);
    return NextResponse.json(
      { error: "Failed to fetch institutions" },
      { status: 500 }
    );
  }
}