import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "~/server/auth";
import { db } from "~/server/db";
import { institution } from "~/server/db/schema";
import { eq } from "drizzle-orm";

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Check if institution exists
    const existingInstitution = await db.select().from(institution).where(eq(institution.id, params.id));

    if (existingInstitution.length === 0) {
      return NextResponse.json(
        { error: "Institution not found" },
        { status: 404 }
      );
    }

    // Prepare update data - locations and boards are already in object format from the form
    const updateData = {
      name: name,
      type: type,
      locations: locations,
      boards: boards,
      phone: phone || null,
      email: email || null,
      website: website || null,
      isActive: isActive !== undefined ? isActive : true,
      updatedAt: new Date(),
    };

    // Update institution
    const updatedInstitution = await db.update(institution)
      .set(updateData)
      .where(eq(institution.id, params.id))
      .returning();

    return NextResponse.json({
      success: true,
      institution: updatedInstitution[0],
      message: "Institution updated successfully"
    });

  } catch (error) {
    console.error("Error updating institution:", error);
    return NextResponse.json(
      { error: "Failed to update institution" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check if user is authenticated and is admin
    const sessionData = await getServerSession();

    if (!sessionData?.session || !sessionData?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (sessionData.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden - Admin access required" }, { status: 403 });
    }

    // Check if institution exists
    const existingInstitution = await db.select().from(institution).where(eq(institution.id, params.id));

    if (existingInstitution.length === 0) {
      return NextResponse.json(
        { error: "Institution not found" },
        { status: 404 }
      );
    }

    // Delete institution
    await db.delete(institution).where(eq(institution.id, params.id));

    return NextResponse.json({
      success: true,
      message: "Institution deleted successfully"
    });

  } catch (error) {
    console.error("Error deleting institution:", error);
    return NextResponse.json(
      { error: "Failed to delete institution" },
      { status: 500 }
    );
  }
}