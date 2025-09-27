import { NextRequest, NextResponse } from "next/server";
import { db } from "~/server/db";
import { institution } from "~/server/db/schema";
import { eq } from "drizzle-orm";

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { error: "Institution ID is required" },
        { status: 400 }
      );
    }

    // Check if institution exists
    const existingInstitution = await db
      .select()
      .from(institution)
      .where(eq(institution.id, id))
      .limit(1);

    if (existingInstitution.length === 0) {
      return NextResponse.json(
        { error: "Institution not found" },
        { status: 404 }
      );
    }

    // Delete the institution
    await db
      .delete(institution)
      .where(eq(institution.id, id));

    return NextResponse.json(
      { success: true, message: "Institution deleted successfully" },
      { status: 200 }
    );

  } catch (error) {
    console.error("Error deleting institution:", error);
    return NextResponse.json(
      { error: "Failed to delete institution" },
      { status: 500 }
    );
  }
}