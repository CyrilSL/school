import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "~/server/auth";
import { db } from "~/server/db";
import { feeApplication, student } from "~/server/db/schema";
import { eq, and } from "drizzle-orm";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const sessionData = await getServerSession();
    if (!sessionData?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;

    // Get the application with student info
    const application = await db.query.feeApplication.findFirst({
      where: eq(feeApplication.id, id),
      with: {
        student: true,
      },
    });

    if (!application) {
      return NextResponse.json(
        { error: "Application not found" },
        { status: 404 }
      );
    }

    // Verify the application belongs to the logged-in parent
    if (application.student.parentId !== sessionData.user.id) {
      return NextResponse.json(
        { error: "Unauthorized to delete this application" },
        { status: 403 }
      );
    }

    // Only allow deletion of applications in onboarding_pending or emi_pending status
    if (!["onboarding_pending", "emi_pending"].includes(application.status)) {
      return NextResponse.json(
        { error: "Cannot delete applications that are in progress or completed" },
        { status: 400 }
      );
    }

    // Delete the application
    await db.delete(feeApplication).where(eq(feeApplication.id, id));

    // Check if the student has any other applications
    const remainingApplications = await db.query.feeApplication.findMany({
      where: eq(feeApplication.studentId, application.studentId),
    });

    // If no applications remain, delete the student record as well
    if (remainingApplications.length === 0) {
      await db.delete(student).where(eq(student.id, application.studentId));
    }

    return NextResponse.json(
      { success: true, message: "Application deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting application:", error);
    return NextResponse.json(
      { error: "Failed to delete application" },
      { status: 500 }
    );
  }
}
