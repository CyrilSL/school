import { NextRequest, NextResponse } from "next/server";
import { db } from "~/server/db";
import { institution } from "~/server/db/schema";
import { eq } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const institutionName = searchParams.get('institutionName');

    // Base query - get all institutions first (remove isActive filter for debugging)
    const allInstitutions = await db.select({
      id: institution.id,
      name: institution.name,
      type: institution.type,
      city: institution.city,
      state: institution.state,
      board: institution.board,
      website: institution.website,
      isActive: institution.isActive,
    }).from(institution);

    // Filter active institutions
    const activeInstitutions = allInstitutions.filter(inst => inst.isActive);

    // If specific institution is requested, return its locations and boards
    if (institutionName) {
      const institutionLocations = activeInstitutions.filter(inst =>
        inst.name.toLowerCase() === institutionName.toLowerCase()
      );

      const locations = institutionLocations.map(inst => ({
        id: inst.id,
        city: inst.city,
        state: inst.state,
        location: `${inst.city}${inst.state ? `, ${inst.state}` : ''}`,
        board: inst.board,
        type: inst.type
      }));

      const boards = [...new Set(institutionLocations.map(inst => inst.board))].filter(Boolean);

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
      group.cities.add(inst.city);
      if (inst.board) group.boards.add(inst.board);
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