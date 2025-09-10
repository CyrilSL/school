import { NextRequest, NextResponse } from "next/server";
import { db } from "~/server/db";
import { parentProfile, student, institution, organization, feeApplication, emiPlan } from "~/server/db/schema";
import { getServerSession } from "~/server/auth";
import { eq, and } from "drizzle-orm";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    
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
      parentAddress: "Parent address",
      relationToStudent: "Relation to student",
      monthlyIncome: "Monthly income",
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
      if (!body[field]) {
        return NextResponse.json({ 
          error: `Missing required field: ${displayName}` 
        }, { status: 400 });
      }
    }

    // Validate PAN format
    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    if (!panRegex.test(parentPan) || !panRegex.test(applicantPan)) {
      return NextResponse.json({ 
        error: "Invalid PAN card number format" 
      }, { status: 400 });
    }

    // Check if parent profile already exists
    const existingProfile = await db.query.parentProfile.findFirst({
      where: eq(parentProfile.userId, session.user.id),
    });

    if (existingProfile) {
      return NextResponse.json({ 
        error: "Onboarding already completed" 
      }, { status: 400 });
    }

    // Parse fee amount
    const feeAmountNumber = parseFloat(feeAmount);
    if (isNaN(feeAmountNumber) || feeAmountNumber <= 0) {
      return NextResponse.json({ 
        error: "Invalid fee amount" 
      }, { status: 400 });
    }

    // Start transaction to create all records
    const result = await db.transaction(async (tx) => {
      // Create parent profile with comprehensive data
      const [newParentProfile] = await tx.insert(parentProfile).values({
        id: crypto.randomUUID(),
        userId: session.user.id,
        
        // Step 3: Parent PAN Details
        fullName: parentName,
        panCardNumber: parentPan,
        phone: parentPhone,
        email: parentEmail,
        address: parentAddress,
        relationToStudent,
        monthlyIncome: monthlyIncome,
        occupation: occupation || null,
        employer: employer || null,
        
        // Step 5: Personal Details
        applicantPan: applicantPan,
        gender: gender,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
        maritalStatus: maritalStatus,
        alternateEmail: email !== parentEmail ? email : null,
        alternatePhone: alternatePhone || null,
        fatherName: fatherName,
        motherName: motherName,
        spouseName: spouseName || null,
        educationLevel: educationLevel || null,
        workExperience: workExperience || null,
        companyType: companyType || null,
        
        // Legacy fields for backward compatibility
        annualIncome: monthlyIncome ? parseFloat(monthlyIncome.split('-')[0].replace(/[₹,]/g, '')) * 12 : null,
        emergencyContactName: null,
        emergencyContactPhone: alternatePhone || null,
        
        // Step 6: Terms & Confirmation
        termsAccepted: termsAccepted,
        privacyAccepted: privacyAccepted,
        creditCheckConsent: creditCheckConsent,
        communicationConsent: communicationConsent,
        
        // System fields
        isOnboardingCompleted: true,
        createdAt: new Date(),
      }).returning();

      // Find or create institution
      let institutionId: string;
      
      const existingInstitution = await tx.query.institution.findFirst({
        where: eq(institution.name, institutionName),
      });

      if (existingInstitution) {
        institutionId = existingInstitution.id;
      } else {
        // Create a new organization for this institution
        const [newOrganization] = await tx.insert(organization).values({
          id: crypto.randomUUID(),
          name: institutionName,
          slug: institutionName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          createdAt: new Date(),
        }).returning();

        // Create new institution
        const [newInstitution] = await tx.insert(institution).values({
          id: crypto.randomUUID(),
          organizationId: newOrganization.id,
          name: institutionName,
          type: "school", // Default to school
          address: institutionAddress || null,
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
        name: studentName,
        rollNumber: studentRollNumber || null,
        dateOfBirth: studentDateOfBirth ? new Date(studentDateOfBirth) : null,
        class: studentClass || null,
        section: studentSection || null,
        previousSchool: previousSchool || null,
        
        // Fee Information
        feeAmount: feeAmountNumber.toFixed(2),
        feeType: feeType,
        
        // System fields
        admissionDate: studentDateOfBirth ? new Date(studentDateOfBirth) : new Date(),
        createdAt: new Date(),
      }).returning();

      // Find the selected EMI plan
      const selectedEmiPlan = await tx.query.emiPlan.findFirst({
        where: eq(emiPlan.id, selectedPlanId),
      });

      // If no EMI plan found, create a custom one based on the selection
      let emiPlanId = selectedPlanId;
      if (!selectedEmiPlan) {
        const planMap: Record<string, { duration: number, name: string }> = {
          "3-months": { duration: 3, name: "3 Month Plan" },
          "6-months": { duration: 6, name: "6 Month Plan" },
          "9-months": { duration: 9, name: "9 Month Plan" },
          "12-months": { duration: 12, name: "12 Month Plan" },
        };

        const planConfig = planMap[selectedPlanId];
        if (planConfig) {
          const [newEmiPlan] = await tx.insert(emiPlan).values({
            id: selectedPlanId,
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
      };
      
      const installments = planMap[selectedPlanId] || 6;
      const monthlyInstallment = Math.ceil(feeAmountNumber / installments);
      const processingFee = feeAmountNumber * 0.02 * (installments / 3);
      const totalAmount = feeAmountNumber + processingFee;

      // Create fee application record
      const [feeApp] = await tx.insert(feeApplication).values({
        id: crypto.randomUUID(),
        studentId: newStudent.id,
        feeStructureId: crypto.randomUUID(), // We'll need to create a fee structure or make this optional
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