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
        emiPlanId: feeApplication.emiPlanId,
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

    // Get onboarding status and next step
    const profile = await db
      .select({
        isOnboardingCompleted: parentProfile.isOnboardingCompleted,
        fullName: parentProfile.fullName,
        applicantPan: parentProfile.applicantPan,
        gender: parentProfile.gender,
        fatherName: parentProfile.fatherName,
        motherName: parentProfile.motherName,
      })
      .from(parentProfile)
      .where(eq(parentProfile.userId, session.user.id))
      .limit(1);

    const isOnboardingCompleted = profile[0]?.isOnboardingCompleted ?? false;

    // Determine next step if onboarding is not completed
    let nextStep = 1;
    if (!isOnboardingCompleted && applications.length > 0) {
      // Check which step they need to complete
      const app = applications[0];
      const prof = profile[0];

      if (!app) {
        nextStep = 1; // Need to create application
      } else if (!app.emiPlanId) {
        nextStep = 2; // Need to select EMI plan
      } else if (!prof?.fullName) {
        nextStep = 3; // Need primary earner details
      } else if (!prof?.applicantPan || !prof?.gender || !prof?.fatherName || !prof?.motherName) {
        nextStep = 5; // Need personal details
      } else {
        nextStep = 6; // Should be completed
      }
    }

    // Transform the data to match the frontend format
    const transformedApplications = applications.map((app) => ({
      id: app.id,
      institution: app.institutionName,
      academicYear: app.academicYear,
      studentName: app.studentName,
      totalFees: Number(app.totalAmount),
      status: getApplicationStatus(app.status, isOnboardingCompleted, app.emiPlanId),
      statusText: getStatusText(app.status, isOnboardingCompleted, app.emiPlanId),
      actionText: getActionText(app.status, isOnboardingCompleted, app.emiPlanId),
      actionUrl: getActionUrl(app.id, app.status, isOnboardingCompleted, nextStep, app.emiPlanId),
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

function getApplicationStatus(dbStatus: string, isOnboardingCompleted: boolean, emiPlanId: string | null) {
  if (!isOnboardingCompleted || !emiPlanId) {
    return "onboarding_pending";
  }

  switch (dbStatus) {
    case "platform_review":
      return "emi_progress";
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

function getStatusText(dbStatus: string, isOnboardingCompleted: boolean, emiPlanId: string | null) {
  if (!isOnboardingCompleted) {
    return "Please complete your application";
  }

  if (!emiPlanId) {
    return "Please select an EMI plan";
  }

  switch (dbStatus) {
    case "platform_review":
      return "Application under review";
    case "approved":
      return "Your EMI plan is active";
    case "active":
      return "EMI plan is active";
    case "paid_to_institution":
      return "Payment completed";
    case "rejected":
      return "Application rejected";
    default:
      return "Application submitted";
  }
}

function getActionText(dbStatus: string, isOnboardingCompleted: boolean, emiPlanId: string | null) {
  if (!isOnboardingCompleted || !emiPlanId) {
    return "Complete Now";
  }

  switch (dbStatus) {
    case "platform_review":
    case "approved":
    case "active":
      return "View Details";
    case "paid_to_institution":
      return "View Receipt";
    case "rejected":
      return "View Details";
    default:
      return "View Details";
  }
}

function getActionUrl(applicationId: string, dbStatus: string, isOnboardingCompleted: boolean, nextStep: number, emiPlanId: string | null) {
  // If onboarding is not completed OR no EMI plan selected, go to the next step
  if (!isOnboardingCompleted || !emiPlanId) {
    return `/parent/apply/steps/${nextStep}`;
  }

  // Otherwise, view application details
  return `/parent/dashboard/applications/${applicationId}`;
}