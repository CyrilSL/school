import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "~/server/auth";
import { db } from "~/server/db";
import { feeApplication, student, institution, feeStructure, emiPlan, parentProfile } from "~/server/db/schema";
import { eq } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get all fee applications for this parent's students
    const applications = await db
      .select({
        id: feeApplication.id,
        status: feeApplication.status,
        totalAmount: feeApplication.totalAmount,
        monthlyInstallment: feeApplication.monthlyInstallment,
        appliedAt: feeApplication.appliedAt,
        approvedAt: feeApplication.approvedAt,
        // Student info
        studentName: student.name,
        studentClass: student.class,
        studentSection: student.section,
        // Institution info
        institutionName: institution.name,
        // Fee structure info
        feeStructureName: feeStructure.name,
        academicYear: feeStructure.academicYear,
        // EMI plan info
        emiPlanName: emiPlan.name,
        emiInstallments: emiPlan.installments,
        emiInterestRate: emiPlan.interestRate,
      })
      .from(feeApplication)
      .innerJoin(student, eq(feeApplication.studentId, student.id))
      .innerJoin(institution, eq(student.institutionId, institution.id))
      .innerJoin(feeStructure, eq(feeApplication.feeStructureId, feeStructure.id))
      .leftJoin(emiPlan, eq(feeApplication.emiPlanId, emiPlan.id))
      .where(eq(student.parentId, session.user.id));

    // Get onboarding status
    const profile = await db
      .select({
        isOnboardingCompleted: parentProfile.isOnboardingCompleted,
      })
      .from(parentProfile)
      .where(eq(parentProfile.userId, session.user.id))
      .limit(1);

    const isOnboardingCompleted = profile[0]?.isOnboardingCompleted ?? false;

    // Transform the data to match the frontend format
    const transformedApplications = applications.map((app) => ({
      id: app.id,
      institution: app.institutionName,
      academicYear: app.academicYear,
      studentName: app.studentName,
      totalFees: Number(app.totalAmount),
      status: getApplicationStatus(app.status, isOnboardingCompleted),
      statusText: getStatusText(app.status, isOnboardingCompleted),
      actionText: getActionText(app.status, isOnboardingCompleted),
      actionUrl: getActionUrl(app.id, app.status, isOnboardingCompleted),
      appliedAt: app.appliedAt?.toISOString(),
      emiPlan: app.emiPlanName ? {
        name: app.emiPlanName,
        installments: app.emiInstallments,
        monthlyAmount: Number(app.monthlyInstallment || 0),
        interestRate: Number(app.emiInterestRate || 0),
      } : null,
    }));

    return NextResponse.json({
      applications: transformedApplications,
      isOnboardingCompleted,
    });

  } catch (error) {
    console.error("Error fetching applications:", error);
    return NextResponse.json(
      { error: "Failed to fetch applications" },
      { status: 500 }
    );
  }
}

function getApplicationStatus(dbStatus: string, isOnboardingCompleted: boolean) {
  if (!isOnboardingCompleted) {
    return "onboarding_pending";
  }

  switch (dbStatus) {
    case "platform_review":
      return "emi_pending";
    case "approved":
      return "emi_progress";
    case "active":
      return "emi_progress";
    case "paid_to_institution":
      return "completed";
    case "rejected":
      return "rejected";
    default:
      return "emi_pending";
  }
}

function getStatusText(dbStatus: string, isOnboardingCompleted: boolean) {
  if (!isOnboardingCompleted) {
    return "Please complete your application";
  }

  switch (dbStatus) {
    case "platform_review":
      return "Please complete your EMI form";
    case "approved":
      return "Your EMI registration is in progress";
    case "active":
      return "EMI plan is active";
    case "paid_to_institution":
      return "Payment completed";
    case "rejected":
      return "Application rejected";
    default:
      return "Please complete your EMI form";
  }
}

function getActionText(dbStatus: string, isOnboardingCompleted: boolean) {
  if (!isOnboardingCompleted) {
    return "Complete Application";
  }

  switch (dbStatus) {
    case "platform_review":
      return "Complete now";
    case "approved":
    case "active":
      return "View Details";
    case "paid_to_institution":
      return "View Receipt";
    case "rejected":
      return "View Details";
    default:
      return "Complete now";
  }
}

function getActionUrl(applicationId: string, dbStatus: string, isOnboardingCompleted: boolean) {
  if (!isOnboardingCompleted) {
    return "/parent/apply/steps/1";
  }

  switch (dbStatus) {
    case "platform_review":
      return `/parent/dashboard/applications/${applicationId}`;
    case "approved":
    case "active":
    case "paid_to_institution":
    case "rejected":
      return `/parent/dashboard/applications/${applicationId}`;
    default:
      return `/parent/dashboard/applications/${applicationId}`;
  }
}