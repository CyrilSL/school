import { NextRequest, NextResponse } from "next/server";
import { db } from "~/server/db";
import { parentProfile, student, institution, organization, feeApplication, emiPlan, feeStructure } from "~/server/db/schema";
import { getServerSession } from "~/server/auth";
import { eq, and } from "drizzle-orm";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    // Debug: log top-level keys received (avoid dumping full PII by default)
    try {
      console.log("[onboarding] POST body keys:", Object.keys(body || {}));
    } catch {}

    // Normalize payload to support both legacy (student-details/parent-pan) and
    // new (student-institution/primary-earner/personal-details) flows.
    const enriched = {
      // Student details
      studentFirstName: body.studentFirstName,
      studentLastName: body.studentLastName,
      studentName: body.studentName ?? [body.studentFirstName, body.studentLastName].filter(Boolean).join(" "),
      studentRollNumber: body.studentRollNumber ?? body.studentId ?? undefined,
      studentDateOfBirth: body.studentDateOfBirth ?? undefined,
      studentClass: body.studentClass ?? body.classStream ?? undefined,
      studentSection: body.studentSection ?? undefined,
      institutionName: body.institutionName,
      institutionAddress: body.institutionAddress ?? body.location ?? undefined,
      previousSchool: body.previousSchool ?? undefined,
      feeAmount: body.feeAmount ?? body.annualFeeAmount ?? undefined,
      feeType: body.feeType ?? (body.annualFeeAmount ? "Annual Fee" : undefined),

      // EMI plan
      selectedPlanId: body.selectedPlanId,

      // Parent details (legacy + new mapping)
      parentName: body.parentName ?? body.fullName ?? [body.firstName, body.lastName].filter(Boolean).join(" "),
      parentPan: body.parentPan ?? body.applicantPan ?? undefined,
      parentPhone: body.parentPhone ?? body.alternatePhone ?? undefined,
      parentEmail: body.parentEmail ?? body.email ?? undefined,
      parentAddress: body.parentAddress ?? undefined,
      relationToStudent: body.relationToStudent ?? "Parent",
      monthlyIncome: body.monthlyIncome ?? undefined,
      occupation: body.occupation ?? undefined,
      employer: body.employer ?? undefined,

      // Personal details
      applicantPan: body.applicantPan ?? body.parentPan ?? undefined,
      gender: body.gender,
      dateOfBirth: body.dateOfBirth,
      maritalStatus: body.maritalStatus,
      email: body.email,
      alternatePhone: body.alternatePhone,
      fatherName: body.fatherName,
      motherName: body.motherName,
      spouseName: body.spouseName,
      educationLevel: body.educationLevel,
      workExperience: body.workExperience,
      companyType: body.companyType,

      // Consents
      termsAccepted: body.termsAccepted,
      privacyAccepted: body.privacyAccepted,
      creditCheckConsent: body.creditCheckConsent,
      communicationConsent: body.communicationConsent,

      // Summary passthrough
      applicationSummary: body.applicationSummary,
    } as any;

    // Normalize selectedPlanId to canonical form when user selected from the new UI
    const normalizePlan = (planId?: string) => {
      switch (planId) {
        case "plan-a":
          return "9-months";
        case "plan-b":
          return "6-months";
        case "plan-c":
          return "12-months";
        case "plan-d":
          return "18-months";
        case "plan-e":
          return "24-months";
        default:
          return planId;
      }
    };
    enriched.selectedPlanId = normalizePlan(enriched.selectedPlanId);
    
    // Extract data from the 6-step onboarding process
    const {
      // Step 1: Student Details
      studentName,
      studentRollNumber,
      studentDateOfBirth,
      studentClass,
      studentSection,
      institutionName,
      institutionAddress,
      previousSchool,
      feeAmount,
      feeType,
      
      // Step 2: EMI Plan Selection
      selectedPlanId,
      
      // Step 3: Parent PAN Details
      parentName,
      parentPan,
      parentPhone,
      parentEmail,
      parentAddress,
      relationToStudent,
      monthlyIncome,
      occupation,
      employer,
      
      // Step 5: Personal Details
      applicantPan,
      gender,
      dateOfBirth,
      maritalStatus,
      email,
      alternatePhone,
      fatherName,
      motherName,
      spouseName,
      educationLevel,
      workExperience,
      companyType,
      
      // Step 6: Terms & Confirmation
      termsAccepted,
      privacyAccepted,
      creditCheckConsent,
      communicationConsent,
      
      // Application summary
      applicationSummary,
    } = body;

    // Validate required fields
    const requiredFields = {
      studentName: "Student name",
      institutionName: "Institution name", 
      feeAmount: "Fee amount",
      feeType: "Fee type",
      selectedPlanId: "EMI plan selection",
      parentName: "Parent name",
      parentPan: "Parent PAN",
      parentPhone: "Parent phone",
      parentEmail: "Parent email",
      // Make these optional for now to support new flow without address/income
      // parentAddress: "Parent address",
      relationToStudent: "Relation to student",
      // monthlyIncome: "Monthly income",
      applicantPan: "Applicant PAN",
      gender: "Gender",
      dateOfBirth: "Date of birth",
      maritalStatus: "Marital status",
      email: "Email address",
      fatherName: "Father's name",
      motherName: "Mother's name",
      termsAccepted: "Terms acceptance",
      privacyAccepted: "Privacy policy acceptance",
      creditCheckConsent: "Credit check consent",
    };

    for (const [field, displayName] of Object.entries(requiredFields)) {
      if (!enriched[field as keyof typeof enriched]) {
        console.error("[onboarding] missing field:", field, displayName);
        return NextResponse.json({ 
          error: `Missing required field: ${displayName}` 
        }, { status: 400 });
      }
    }

    // Validate PAN format
    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    if (!panRegex.test(enriched.parentPan) || !panRegex.test(enriched.applicantPan)) {
      return NextResponse.json({ 
        error: "Invalid PAN card number format" 
      }, { status: 400 });
    }

    // Check if parent profile already exists
    const existingProfile = await db.query.parentProfile.findFirst({
      where: eq(parentProfile.userId, session.user.id),
    });

    if (existingProfile?.isOnboardingCompleted) {
      return NextResponse.json({ 
        error: "Onboarding already completed" 
      }, { status: 400 });
    }

    // Parse fee amount
    const feeAmountNumber = parseFloat(String(enriched.feeAmount));
    if (isNaN(feeAmountNumber) || feeAmountNumber <= 0) {
      return NextResponse.json({ 
        error: "Invalid fee amount" 
      }, { status: 400 });
    }

    // Start transaction to create all records
    const result = await db.transaction(async (tx) => {
      // Create or update parent profile with comprehensive data
      let newParentProfile;
      const profileValues = {
        // Step 3: Parent PAN Details
        fullName: enriched.parentName,
        panCardNumber: enriched.parentPan,
        phone: enriched.parentPhone,
        email: enriched.parentEmail,
        address: enriched.parentAddress || null,
        relationToStudent: enriched.relationToStudent,
        monthlyIncome: enriched.monthlyIncome || null,
        occupation: enriched.occupation || null,
        employer: enriched.employer || null,

        // Step 5: Personal Details
        applicantPan: enriched.applicantPan,
        gender: enriched.gender,
        dateOfBirth: enriched.dateOfBirth ? new Date(enriched.dateOfBirth) : null,
        maritalStatus: enriched.maritalStatus,
        alternateEmail: enriched.email && enriched.email !== enriched.parentEmail ? enriched.email : null,
        alternatePhone: enriched.alternatePhone || null,
        fatherName: enriched.fatherName,
        motherName: enriched.motherName,
        spouseName: enriched.spouseName || null,
        educationLevel: enriched.educationLevel || null,
        workExperience: enriched.workExperience || null,
        companyType: enriched.companyType || null,

        // Legacy fields for backward compatibility
        annualIncome: enriched.monthlyIncome ? parseFloat(enriched.monthlyIncome.split('-')[0].replace(/[₹,]/g, '')) * 12 : null,
        emergencyContactName: null,
        emergencyContactPhone: enriched.alternatePhone || null,

        // Step 6: Terms & Confirmation
        termsAccepted: enriched.termsAccepted,
        privacyAccepted: enriched.privacyAccepted,
        creditCheckConsent: enriched.creditCheckConsent,
        communicationConsent: enriched.communicationConsent,

        // System fields
        isOnboardingCompleted: true,
      } as const;

      if (existingProfile) {
        const updated = await tx
          .update(parentProfile)
          .set({
            ...profileValues,
            updatedAt: new Date(),
          })
          .where(eq(parentProfile.userId, session.user.id))
          .returning();
        newParentProfile = updated[0]!;
      } else {
        const inserted = await tx
          .insert(parentProfile)
          .values({
            id: crypto.randomUUID(),
            userId: session.user.id,
            ...profileValues,
            createdAt: new Date(),
          })
          .returning();
        newParentProfile = inserted[0]!;
      }

      // Find or create institution
      let institutionId: string;
      
      const existingInstitution = await tx.query.institution.findFirst({
        where: eq(institution.name, enriched.institutionName),
      });

      if (existingInstitution) {
        institutionId = existingInstitution.id;
      } else {
        // Create a new organization for this institution
        const [newOrganization] = await tx.insert(organization).values({
          id: crypto.randomUUID(),
          name: enriched.institutionName!,
          slug: enriched.institutionName!.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          createdAt: new Date(),
        }).returning();

        // Create new institution
        const [newInstitution] = await tx.insert(institution).values({
          id: crypto.randomUUID(),
          organizationId: newOrganization.id,
          name: enriched.institutionName!,
          type: "school", // Default to school
          address: enriched.institutionAddress || null,
          createdAt: new Date(),
        }).returning();

        institutionId = newInstitution.id;
      }

      // Create student record with comprehensive data
      const [newStudent] = await tx.insert(student).values({
        id: crypto.randomUUID(),
        parentId: session.user.id,
        institutionId,
        
        // Step 1: Student Details
        name: enriched.studentName!,
        rollNumber: enriched.studentRollNumber || null,
        dateOfBirth: enriched.studentDateOfBirth ? new Date(enriched.studentDateOfBirth) : null,
        class: enriched.studentClass || null,
        section: enriched.studentSection || null,
        previousSchool: enriched.previousSchool || null,
        
        // Fee Information
        feeAmount: feeAmountNumber.toFixed(2),
        feeType: enriched.feeType!,
        
        // System fields
        admissionDate: enriched.studentDateOfBirth ? new Date(enriched.studentDateOfBirth) : new Date(),
        createdAt: new Date(),
      }).returning();

      // Find the selected EMI plan
      const selectedEmiPlan = await tx.query.emiPlan.findFirst({
        where: eq(emiPlan.id, enriched.selectedPlanId),
      });

      // If no EMI plan found, create a custom one based on the selection
      let emiPlanId = enriched.selectedPlanId as string;
      if (!selectedEmiPlan) {
        const planMap: Record<string, { duration: number, name: string }> = {
          "3-months": { duration: 3, name: "3 Month Plan" },
          "6-months": { duration: 6, name: "6 Month Plan" },
          "9-months": { duration: 9, name: "9 Month Plan" },
          "12-months": { duration: 12, name: "12 Month Plan" },
          "18-months": { duration: 18, name: "18 Month Plan" },
          "24-months": { duration: 24, name: "24 Month Plan" },
        };

        const planConfig = planMap[emiPlanId];
        if (planConfig) {
          const [newEmiPlan] = await tx.insert(emiPlan).values({
            id: emiPlanId,
            name: planConfig.name,
            installments: planConfig.duration,
            interestRate: "0.00",
            processingFee: (feeAmountNumber * 0.02 * (planConfig.duration / 3)).toFixed(2),
            isActive: true,
            minAmount: "1000.00",
            maxAmount: "1000000.00",
            description: `Zero interest EMI plan for ${planConfig.duration} months`,
            createdAt: new Date(),
          }).returning();
          
          emiPlanId = newEmiPlan.id;
        }
      }

      // Calculate EMI details
      const planMap: Record<string, number> = {
        "3-months": 3,
        "6-months": 6,
        "9-months": 9,
        "12-months": 12,
        "18-months": 18,
        "24-months": 24,
      };
      
      const installments = planMap[emiPlanId] || 6;
      const monthlyInstallment = Math.ceil(feeAmountNumber / installments);
      const processingFee = feeAmountNumber * 0.02 * (installments / 3);
      const totalAmount = feeAmountNumber + processingFee;

      // Find or create a fee structure for this application (FK required)
      const academicYear = (() => {
        const now = new Date();
        const y = now.getFullYear();
        const next = y + 1;
        return `${y}-${next}`;
      })();

      const feeName = enriched.feeType || 'Tuition Fee';

      let fs = await tx.query.feeStructure.findFirst({
        where: and(
          eq(feeStructure.institutionId, institutionId),
          eq(feeStructure.name, feeName),
        ),
      });

      if (!fs) {
        const insertedFs = await tx.insert(feeStructure).values({
          id: crypto.randomUUID(),
          institutionId,
          name: feeName,
          description: 'Auto-created during onboarding',
          amount: feeAmountNumber.toFixed(2),
          academicYear,
          createdAt: new Date(),
        }).returning();
        fs = insertedFs[0]!;
      }

      // Create fee application record
      const [feeApp] = await tx.insert(feeApplication).values({
        id: crypto.randomUUID(),
        studentId: newStudent.id,
        feeStructureId: fs.id,
        emiPlanId: emiPlanId,
        status: "platform_review",
        totalAmount: totalAmount.toFixed(2),
        remainingAmount: totalAmount.toFixed(2),
        monthlyInstallment: monthlyInstallment.toFixed(2),
        platformPaidToInstitution: false,
        appliedAt: new Date(),
        createdAt: new Date(),
      }).returning();

      return {
        parentProfile: newParentProfile,
        student: newStudent,
        feeApplication: feeApp,
        emiPlan: {
          id: emiPlanId,
          installments,
          monthlyInstallment,
          totalAmount,
          processingFee,
        }
      };
    });

    return NextResponse.json({ 
      success: true,
      message: "Onboarding completed successfully! Your loan application is being processed.",
      data: result
    });

  } catch (error) {
    console.error("Error in parent onboarding:", error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : "Internal server error"
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if onboarding is completed
    const profile = await db.query.parentProfile.findFirst({
      where: eq(parentProfile.userId, session.user.id),
      with: {
        // Add relations if needed
      }
    });

    return NextResponse.json({
      isOnboardingCompleted: profile?.isOnboardingCompleted || false,
      profile,
    });
  } catch (error) {
    console.error("Error checking onboarding status:", error);
    return NextResponse.json({ 
      error: "Internal server error" 
    }, { status: 500 });
  }
}
