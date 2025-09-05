import { NextRequest, NextResponse } from "next/server";
import { db } from "~/server/db";
import { feeApplication, student, feeStructure, emiPlan, installment, user } from "~/server/db/schema";
import { getServerSession } from "~/server/auth";
import { eq, and, desc } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // TODO: Add proper role checking for institution admin
    // For now, assume user has access to institution data

    // Get all fee applications with related data
    const applications = await db.query.feeApplication.findMany({
      with: {
        student: {
          with: {
            parent: true, // This might need adjustment based on your schema relations
          },
        },
        feeStructure: true,
        emiPlan: true,
      },
      orderBy: [desc(feeApplication.createdAt)],
    });

    // Get installment details for each application
    const applicationsWithInstallments = await Promise.all(
      applications.map(async (app) => {
        const installments = await db.query.installment.findMany({
          where: eq(installment.feeApplicationId, app.id),
          orderBy: [installment.installmentNumber],
        });

        return {
          ...app,
          installments,
        };
      })
    );

    // Calculate summary statistics
    const totalApplications = applications.length;
    const pendingApprovals = applications.filter(app => app.status === "pending").length;
    const activeEMIs = applications.filter(app => app.status === "approved" || app.status === "active").length;
    const totalCollected = applications.reduce((sum, app) => {
      const totalAmount = parseFloat(app.totalAmount);
      const remainingAmount = parseFloat(app.remainingAmount);
      return sum + (totalAmount - remainingAmount);
    }, 0);

    return NextResponse.json({
      applications: applicationsWithInstallments,
      summary: {
        totalApplications,
        pendingApprovals,
        activeEMIs,
        totalCollected,
      },
    });
  } catch (error) {
    console.error("Error fetching institution fees:", error);
    return NextResponse.json({ 
      error: "Internal server error" 
    }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession();
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { applicationId, action } = body;

    if (!applicationId || !action) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (!["approve", "reject"].includes(action)) {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    // Update application status
    const [updatedApplication] = await db
      .update(feeApplication)
      .set({
        status: action === "approve" ? "approved" : "rejected",
        approvedAt: action === "approve" ? new Date() : null,
        approvedBy: action === "approve" ? session.user.id : null,
      })
      .where(eq(feeApplication.id, applicationId))
      .returning();

    return NextResponse.json({ 
      success: true,
      application: updatedApplication
    });
  } catch (error) {
    console.error("Error updating application status:", error);
    return NextResponse.json({ 
      error: "Internal server error" 
    }, { status: 500 });
  }
}