import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "~/server/auth";
import { db } from "~/server/db";
import { location } from "~/server/db/schema";
import { eq } from "drizzle-orm";

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

    // Check if location exists
    const existingLocation = await db.select()
      .from(location)
      .where(eq(location.id, params.id))
      .limit(1);

    if (existingLocation.length === 0) {
      return NextResponse.json(
        { error: "Location not found" },
        { status: 404 }
      );
    }

    // Check if location is being used (has usage count > 0)
    if (existingLocation[0].usageCount > 0) {
      return NextResponse.json(
        { error: "Cannot delete location that is currently being used by institutions" },
        { status: 400 }
      );
    }

    // Delete location
    await db.delete(location).where(eq(location.id, params.id));

    return NextResponse.json({
      success: true,
      message: "Location deleted successfully"
    });

  } catch (error) {
    console.error("Error deleting location:", error);
    return NextResponse.json(
      { error: "Failed to delete location" },
      { status: 500 }
    );
  }
}