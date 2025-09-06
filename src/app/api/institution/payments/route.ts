import { NextRequest, NextResponse } from "next/server";
import { db } from "~/server/db";
import { institutionPayment, feeApplication, student, feeStructure } from "~/server/db/schema";
import { getServerSession } from "~/server/auth";
import { eq, and, desc } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // TODO: Add proper institution role checking
    // For now, assume user has access to institution data

    // Get institution payments (lump sum payments from platform)
    const payments = await db.query.institutionPayment.findMany({
      // where: eq(institutionPayment.institutionId, userInstitutionId), // TODO: Get user's institution ID
      orderBy: [desc(institutionPayment.createdAt)],
    });

    // Get EMI applications that are being handled by platform
    const emiApplications = await db.query.feeApplication.findMany({
      where: eq(feeApplication.emiPlanId, "not null"), // Applications with EMI plans
      with: {
        student: true,
        feeStructure: true,
        emiPlan: true,
      },
      orderBy: [desc(feeApplication.createdAt)],
    });

    // Calculate summary
    const totalPaymentsReceived = payments.reduce((sum, payment) => 
      sum + parseFloat(payment.totalAmount), 0
    );
    
    const pendingEMIApprovals = emiApplications.filter(app => 
      app.status === "platform_review"
    ).length;

    const activeEMIs = emiApplications.filter(app => 
      app.status === "approved" || app.status === "active"
    ).length;

    const paidToInstitution = emiApplications.filter(app => 
      app.platformPaidToInstitution
    ).length;

    return NextResponse.json({
      payments,
      emiApplications,
      summary: {
        totalPaymentsReceived,
        pendingEMIApprovals,
        activeEMIs,
        paidToInstitution,
        totalEMIApplications: emiApplications.length,
      },
    });
  } catch (error) {
    console.error("Error fetching institution payments:", error);
    return NextResponse.json({ 
      error: "Internal server error" 
    }, { status: 500 });
  }
}