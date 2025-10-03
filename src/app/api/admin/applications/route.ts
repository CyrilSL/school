import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "~/server/auth";
import { db } from "~/server/db";
import { feeApplication, student, institution, feeStructure, emiPlan, parentProfile, user } from "~/server/db/schema";
import { eq, inArray } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();

    if (!session?.user?.id || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("Admin fetching applications...");

    // Get only applications that are submitted for review (have EMI plan selected)
    // Exclude applications where parents haven't completed the EMI selection
    const allApplications = await db.query.feeApplication.findMany({
      with: {
        student: true,
        feeStructure: true,
        emiPlan: true,
      },
    });

    // Filter to only include applications that have EMI plan (meaning they're completed)
    const applications = allApplications.filter(app => app.emiPlanId !== null);

    console.log("Found applications:", applications.length);

    // Get unique IDs for related data
    const parentIds = [...new Set(applications.map(app => app.student.parentId))];
    const institutionIds = [...new Set(applications.map(app => app.student.institutionId))];
    console.log("Parent IDs:", parentIds);
    console.log("Institution IDs:", institutionIds);

    // Fetch related data
    const parents = parentIds.length > 0
      ? await db.query.user.findMany({
          where: inArray(user.id, parentIds),
        })
      : [];

    const institutions = institutionIds.length > 0
      ? await db.query.institution.findMany({
          where: inArray(institution.id, institutionIds),
        })
      : [];

    const profiles = parentIds.length > 0
      ? await db
          .select()
          .from(parentProfile)
          .where(inArray(parentProfile.userId, parentIds))
      : [];

    console.log("Found parents:", parents.length);
    console.log("Found institutions:", institutions.length);
    console.log("Found profiles:", profiles.length);

    const parentMap = new Map(parents.map(p => [p.id, p]));
    const institutionMap = new Map(institutions.map(i => [i.id, i]));
    const profileMap = new Map(profiles.map(p => [p.userId, p]));

    // Transform the data
    const transformedApplications = applications.map((app, index) => {
      try {
        const parent = parentMap.get(app.student.parentId);
        const inst = institutionMap.get(app.student.institutionId);
        const profile = profileMap.get(app.student.parentId);

        return {
          id: app.id,
          status: app.status,
          appliedAt: app.appliedAt?.toISOString(),
          approvedAt: app.approvedAt?.toISOString(),
          rejectedAt: app.rejectedAt?.toISOString(),

          // Financial details
          totalAmount: Number(app.totalAmount),
          monthlyInstallment: app.monthlyInstallment ? Number(app.monthlyInstallment) : null,

          // Student details
          student: {
            id: app.student.id,
            name: app.student.name,
            class: app.student.class,
            section: app.student.section,
            rollNumber: app.student.rollNumber,
            dateOfBirth: app.student.dateOfBirth?.toISOString(),
            feeAmount: app.student.feeAmount ? Number(app.student.feeAmount) : null,
            feeType: app.student.feeType,
            previousSchool: app.student.previousSchool,
          },

          // Parent details
          parent: {
            id: parent?.id || app.student.parentId,
            name: parent?.name || 'Unknown',
            email: parent?.email || 'Unknown',
            fullName: profile?.fullName,
            applicantPan: profile?.applicantPan,
            gender: profile?.gender,
            fatherName: profile?.fatherName,
            motherName: profile?.motherName,
            aadhaarNumber: profile?.aadhaarNumber,
            drivingLicense: profile?.drivingLicense,
            voterId: profile?.voterId,
            passport: profile?.passport,
            dateOfBirth: profile?.dateOfBirth?.toISOString(),
            residenceType: profile?.residenceType,
            educationQualification: profile?.educationQualification,
            profession: profile?.profession,
            companyName: profile?.companyName,
            designation: profile?.designation,
            monthlyIncome: profile?.monthlyIncome ? Number(profile.monthlyIncome) : null,
            employmentType: profile?.employmentType,
            yearsInCurrentJob: profile?.yearsInCurrentJob,
            currentAddress: profile?.currentAddress,
            currentPincode: profile?.currentPincode,
            currentCity: profile?.currentCity,
            currentState: profile?.currentState,
          },

          // Institution details
          institution: {
            name: inst?.name || 'Unknown',
            type: inst?.type || 'Unknown',
            city: inst?.city || null,
            state: inst?.state || null,
          },

          // Fee structure details
          feeStructure: {
            name: app.feeStructure.name,
            amount: Number(app.feeStructure.amount),
            academicYear: app.feeStructure.academicYear,
            semester: app.feeStructure.semester,
          },

          // EMI plan details
          emiPlan: app.emiPlan ? {
            name: app.emiPlan.name,
            installments: app.emiPlan.installments,
            interestRate: Number(app.emiPlan.interestRate || 0),
            processingFee: Number(app.emiPlan.processingFee || 0),
          } : null,
        };
      } catch (error) {
        console.error(`Error transforming application at index ${index}:`, error);
        console.error("Application data:", app);
        throw error;
      }
    });

    console.log("Transformed applications:", transformedApplications.length);

    return NextResponse.json({
      applications: transformedApplications,
      total: transformedApplications.length,
      pendingReview: transformedApplications.filter(app => app.status === "platform_review").length,
    });

  } catch (error) {
    console.error("Error fetching applications:", error);
    console.error("Error stack:", error instanceof Error ? error.stack : "Unknown error");
    return NextResponse.json(
      { error: "Failed to fetch applications", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
