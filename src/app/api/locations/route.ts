import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "~/server/auth";
import { db } from "~/server/db";
import { location } from "~/server/db/schema";
import { nanoid } from "nanoid";
import { desc, ilike, sql } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    // Check if user is authenticated
    const sessionData = await getServerSession();

    if (!sessionData?.session || !sessionData?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");
    const limit = parseInt(searchParams.get("limit") || "50");

    let query = db.select().from(location).where(sql`${location.isActive} = true`);

    // If search term provided, filter by display name or city
    if (search) {
      query = query.where(
        sql`${location.displayName} ILIKE ${`%${search}%`} OR ${location.city} ILIKE ${`%${search}%`}`
      );
    }

    // Order by usage count (most used first) then alphabetically
    const locations = await query
      .orderBy(desc(location.usageCount), location.displayName)
      .limit(limit);

    return NextResponse.json({
      success: true,
      locations: locations.map(loc => ({
        id: loc.id,
        displayName: loc.displayName,
        city: loc.city,
        state: loc.state,
        usageCount: loc.usageCount
      }))
    });

  } catch (error) {
    console.error("Error fetching locations:", error);
    return NextResponse.json(
      { error: "Failed to fetch locations" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check if user is authenticated
    const sessionData = await getServerSession();

    if (!sessionData?.session || !sessionData?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { displayName } = body;

    if (!displayName) {
      return NextResponse.json(
        { error: "Display name is required" },
        { status: 400 }
      );
    }

    // Parse city and state from display name (e.g., "Mumbai, Maharashtra")
    const parts = displayName.split(',').map((part: string) => part.trim());
    const city = parts[0];
    const state = parts[1] || null;

    // Check if location already exists
    const existingLocation = await db.select()
      .from(location)
      .where(sql`${location.displayName} ILIKE ${displayName}`)
      .limit(1);

    if (existingLocation.length > 0) {
      // Update usage count
      await db.update(location)
        .set({
          usageCount: sql`${location.usageCount} + 1`,
          updatedAt: new Date()
        })
        .where(sql`${location.id} = ${existingLocation[0].id}`);

      return NextResponse.json({
        success: true,
        location: existingLocation[0],
        message: "Location already exists, usage count updated"
      });
    }

    // Create new location
    const locationId = `loc_${city.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${nanoid(6)}`;

    const newLocation = await db.insert(location).values({
      id: locationId,
      city: city,
      state: state,
      displayName: displayName,
      usageCount: 1,
      createdAt: new Date(),
    }).returning();

    return NextResponse.json({
      success: true,
      location: newLocation[0],
      message: "New location created successfully"
    });

  } catch (error) {
    console.error("Error creating location:", error);
    return NextResponse.json(
      { error: "Failed to create location" },
      { status: 500 }
    );
  }
}