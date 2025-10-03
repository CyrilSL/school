import { NextRequest, NextResponse } from "next/server";
import { db } from "~/server/db";
import { feeApplication, student, feeStructure, emiPlan, institution } from "~/server/db/schema";
import { getServerSession } from "~/server/auth";
import { eq } from "drizzle-orm";

export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const params = await context.params;
    const appId = params?.id;
    if (!appId) {
      return NextResponse.json({ error: "No application ID" }, { status: 400 });
    }
    // Get application with student, feeStructure, emiPlan
    const application = await db.query.feeApplication.findFirst({
      where: eq(feeApplication.id, appId),
      with: {
        student: true,
        feeStructure: true,
        emiPlan: true,
      },
    });

    // Check if found and owned by user
    if (!application || application.student.parentId !== session.user.id) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // Fetch institution separately
    const inst = await db.query.institution.findFirst({
      where: eq(institution.id, application.student.institutionId),
    });

    // Return application with institution data merged
    return NextResponse.json({
      ...application,
      student: {
        ...application.student,
        institution: inst,
      },
    });
  } catch (err) {
    console.error("Error fetching application by ID:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
