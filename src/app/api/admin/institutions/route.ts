import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "~/server/auth";
import { db } from "~/server/db";
import { institution, organization } from "~/server/db/schema";
import { nanoid } from "nanoid";

export async function POST(request: NextRequest) {
  try {
    // Check if user is authenticated and is admin
    const sessionData = await getServerSession();

    if (!sessionData?.session || !sessionData?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (sessionData.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden - Admin access required" }, { status: 403 });
    }

    // Parse request body
    const body = await request.json();
    const { name, type, locations, boards, phone, email, website, isActive } = body;

    // Validate required fields
    if (!name || !type) {
      return NextResponse.json(
        { error: "Missing required fields: name, type" },
        { status: 400 }
      );
    }

    if (!locations || !Array.isArray(locations) || locations.length === 0) {
      return NextResponse.json(
        { error: "Missing required field: locations (must be array with at least one location)" },
        { status: 400 }
      );
    }

    if (!boards || !Array.isArray(boards) || boards.length === 0) {
      return NextResponse.json(
        { error: "Missing required field: boards (must be array with at least one board)" },
        { status: 400 }
      );
    }

    // Validate email format if provided
    if (email && !email.includes('@')) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    // Create organization first (required by schema)
    const organizationId = nanoid();
    await db.insert(organization).values({
      id: organizationId,
      name: name,
      slug: name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
      createdAt: new Date(),
    });

    // Locations and boards are already in object format from the form

    // Create institution
    const institutionId = nanoid();
    const institutionData = {
      id: institutionId,
      organizationId: organizationId,
      name: name,
      type: type,
      locations: locations,
      boards: boards,
      phone: phone || null,
      email: email || null,
      website: website || null,
      isActive: isActive !== undefined ? isActive : true,
      createdAt: new Date(),
    };

    const newInstitution = await db.insert(institution).values(institutionData).returning();

    return NextResponse.json({
      success: true,
      institution: newInstitution[0],
      message: "Institution created successfully"
    });

  } catch (error) {
    console.error("Error creating institution:", error);
    return NextResponse.json(
      { error: "Failed to create institution" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Check if user is authenticated and is admin
    const sessionData = await getServerSession();

    if (!sessionData?.session || !sessionData?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (sessionData.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden - Admin access required" }, { status: 403 });
    }

    // Get all institutions
    const institutions = await db.select().from(institution).orderBy(institution.createdAt);

    return NextResponse.json({
      success: true,
      institutions: institutions
    });

  } catch (error) {
    console.error("Error fetching institutions:", error);
    return NextResponse.json(
      { error: "Failed to fetch institutions" },
      { status: 500 }
    );
  }
}