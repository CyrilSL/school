import { NextRequest, NextResponse } from "next/server";
import { db } from "~/server/db";
import { installment, feeApplication, student } from "~/server/db/schema";
import { getServerSession } from "~/server/auth";
import { eq, and, desc } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const applicationId = searchParams.get("applicationId");

    if (!applicationId) {
      return NextResponse.json({ error: "Application ID required" }, { status: 400 });
    }

    // Verify application belongs to this parent's student
    const application = await db.query.feeApplication.findFirst({
      where: eq(feeApplication.id, applicationId),
      with: {
        student: true,
      },
    });

    if (!application || application.student.parentId !== session.user.id) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 });
    }

    // Get installments for this application
    const installments = await db.query.installment.findMany({
      where: eq(installment.feeApplicationId, applicationId),
      orderBy: [installment.installmentNumber],
    });

    return NextResponse.json({ installments });
  } catch (error) {
    console.error("Error fetching installments:", error);
    return NextResponse.json({ 
      error: "Internal server error" 
    }, { status: 500 });
  }
}