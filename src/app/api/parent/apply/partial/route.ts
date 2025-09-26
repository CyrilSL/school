import { NextRequest, NextResponse } from "next/server";
import { db } from "~/server/db";
import { parentProfile, student, institution, organization, feeStructure, feeApplication } from "~/server/db/schema";
import { getServerSession } from "~/server/auth";
import { eq } from "drizzle-orm";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { step, data } = body;

    if (!step || !data) {
      return NextResponse.json({
        error: "Missing step or data"
      }, { status: 400 });
    }

    // Check if parent profile exists, create if not
    let parentProfileRecord = await db.query.parentProfile.findFirst({
      where: eq(parentProfile.userId, session.user.id),
    });

    if (!parentProfileRecord) {
      const [newProfile] = await db.insert(parentProfile).values({
        id: crypto.randomUUID(),
        userId: session.user.id,
        isOnboardingCompleted: false,
        createdAt: new Date(),
      }).returning();
      parentProfileRecord = newProfile;
    }

    // Handle different steps
    switch (step) {
      case 1: // Student & Institution Details
        await handleStep1(parentProfileRecord.id, data);
        break;
      case 2: // EMI Plan Selection
        await handleStep2(parentProfileRecord.id, data);
        break;
      case 3: // Primary Earner (Step 3 is actually Primary Earner, not Parent PAN)
        await handleStep3(parentProfileRecord.id, data);
        break;
      case 4: // Parent PAN Details (This might be step 4)
        await handleStep4(parentProfileRecord.id, data);
        break;
      case 5: // Personal Details
        await handleStep5(parentProfileRecord.id, data);
        break;
      default:
        return NextResponse.json({
          error: "Invalid step number"
        }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: `Step ${step} data saved successfully`
    });

  } catch (error) {
    console.error("Error saving partial onboarding data:", error);
    return NextResponse.json({
      error: error instanceof Error ? error.message : "Internal server error"
    }, { status: 500 });
  }
}

async function handleStep1(parentProfileId: string, data: any) {
  const {
    institutionName,
    location,
    board,
    academicYear,
    studentFirstName,
    studentLastName,
    admissionType,
    classStream,
    studentId,
    annualFeeAmount,
  } = data;

  // Get parent user ID
  const parentProfileRecord = await db.query.parentProfile.findFirst({
    where: eq(parentProfile.id, parentProfileId)
  });

  if (!parentProfileRecord) {
    throw new Error("Parent profile not found");
  }

  // Find or create institution
  let institutionRecord = await db.query.institution.findFirst({
    where: eq(institution.name, institutionName),
  });

  if (!institutionRecord) {
    // Create organization first
    const [newOrganization] = await db.insert(organization).values({
      id: crypto.randomUUID(),
      name: institutionName,
      slug: institutionName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      createdAt: new Date(),
    }).returning();

    // Create institution
    const [newInstitution] = await db.insert(institution).values({
      id: crypto.randomUUID(),
      organizationId: newOrganization.id,
      name: institutionName,
      type: "school",
      address: location || null,
      createdAt: new Date(),
    }).returning();

    institutionRecord = newInstitution;
  }

  // Check if student already exists for this parent
  let existingStudent = await db.query.student.findFirst({
    where: eq(student.parentId, parentProfileRecord.userId),
  });

  const studentData = {
    name: `${studentFirstName} ${studentLastName}`,
    rollNumber: studentId || null,
    class: classStream || null,
    feeAmount: parseFloat(annualFeeAmount).toFixed(2),
    feeType: "Annual Fee",
    institutionId: institutionRecord.id,
    updatedAt: new Date(),
  };

  let studentRecord;

  if (existingStudent) {
    // Update existing student
    const [updatedStudent] = await db.update(student)
      .set(studentData)
      .where(eq(student.id, existingStudent.id))
      .returning();
    studentRecord = updatedStudent;
  } else {
    // Create new student
    const [newStudent] = await db.insert(student).values({
      id: crypto.randomUUID(),
      parentId: parentProfileRecord.userId,
      ...studentData,
      createdAt: new Date(),
    }).returning();
    studentRecord = newStudent;
  }

  // Create or find fee structure for this institution and academic year
  let feeStructureRecord = await db.query.feeStructure.findFirst({
    where: eq(feeStructure.institutionId, institutionRecord.id),
  });

  if (!feeStructureRecord) {
    // Create a default fee structure
    const [newFeeStructure] = await db.insert(feeStructure).values({
      id: crypto.randomUUID(),
      institutionId: institutionRecord.id,
      name: "Annual Tuition Fee",
      description: "Annual academic fee",
      amount: parseFloat(annualFeeAmount).toFixed(2),
      academicYear: academicYear,
      createdAt: new Date(),
    }).returning();
    feeStructureRecord = newFeeStructure;
  }

  // Check if fee application already exists for this student
  const existingApplication = await db.query.feeApplication.findFirst({
    where: eq(feeApplication.studentId, studentRecord.id),
  });

  if (!existingApplication) {
    // Create fee application immediately
    await db.insert(feeApplication).values({
      id: crypto.randomUUID(),
      studentId: studentRecord.id,
      feeStructureId: feeStructureRecord.id,
      emiPlanId: null, // Will be set in step 2
      status: "platform_review",
      totalAmount: parseFloat(annualFeeAmount).toFixed(2),
      remainingAmount: parseFloat(annualFeeAmount).toFixed(2),
      appliedAt: new Date(),
      createdAt: new Date(),
    });
  } else {
    // Update existing application
    await db.update(feeApplication)
      .set({
        feeStructureId: feeStructureRecord.id,
        totalAmount: parseFloat(annualFeeAmount).toFixed(2),
        remainingAmount: parseFloat(annualFeeAmount).toFixed(2),
        updatedAt: new Date(),
      })
      .where(eq(feeApplication.id, existingApplication.id));
  }
}

async function handleStep2(parentProfileId: string, data: any) {
  // Get parent user ID
  const parentProfileRecord = await db.query.parentProfile.findFirst({
    where: eq(parentProfile.id, parentProfileId)
  });

  if (!parentProfileRecord) {
    throw new Error("Parent profile not found");
  }

  // Find the student's fee application
  const studentRecord = await db.query.student.findFirst({
    where: eq(student.parentId, parentProfileRecord.userId),
  });

  if (!studentRecord) {
    throw new Error("Student record not found");
  }

  const applicationRecord = await db.query.feeApplication.findFirst({
    where: eq(feeApplication.studentId, studentRecord.id),
  });

  if (!applicationRecord) {
    throw new Error("Fee application not found");
  }

  // Update the fee application with EMI plan selection
  const { emiPlanId, monthlyInstallment } = data;

  await db.update(feeApplication)
    .set({
      emiPlanId: emiPlanId || null,
      monthlyInstallment: monthlyInstallment ? parseFloat(monthlyInstallment).toFixed(2) : null,
      updatedAt: new Date(),
    })
    .where(eq(feeApplication.id, applicationRecord.id));
}

async function handleStep3(parentProfileId: string, data: any) {
  const {
    fullName,
    firstName,
    lastName,
  } = data;

  await db.update(parentProfile)
    .set({
      fullName: fullName || `${firstName} ${lastName}`,
      updatedAt: new Date(),
    })
    .where(eq(parentProfile.id, parentProfileId));
}

async function handleStep4(parentProfileId: string, data: any) {
  const {
    fullName,
    // Add other primary earner fields as needed
  } = data;

  await db.update(parentProfile)
    .set({
      fullName,
      updatedAt: new Date(),
    })
    .where(eq(parentProfile.id, parentProfileId));
}

async function handleStep5(parentProfileId: string, data: any) {
  const {
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
  } = data;

  await db.update(parentProfile)
    .set({
      applicantPan,
      gender,
      dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
      maritalStatus,
      alternateEmail: email,
      alternatePhone: alternatePhone || null,
      fatherName,
      motherName,
      spouseName: spouseName || null,
      educationLevel: educationLevel || null,
      workExperience: workExperience || null,
      companyType: companyType || null,
      updatedAt: new Date(),
    })
    .where(eq(parentProfile.id, parentProfileId));
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get saved partial data
    const profile = await db.query.parentProfile.findFirst({
      where: eq(parentProfile.userId, session.user.id),
    });

    // Get student data if exists
    const studentData = await db.query.student.findFirst({
      where: eq(student.parentId, session.user.id),
    });

    // Determine the next incomplete step
    let nextStep = 1;
    let completedSteps = {
      step1: false, // Student & Institution Details
      step2: false, // EMI Plan Selection
      step3: false, // Primary Earner
      step4: true,  // Welcome/Intro (always complete, no data)
      step5: false, // Personal Details
    };

    if (profile) {
      // Check if onboarding is fully completed
      if (profile.isOnboardingCompleted) {
        return NextResponse.json({
          profile,
          student: studentData,
          isCompleted: true,
          nextStep: 6, // Final confirmation step
          completedSteps,
        });
      }

      // Step 1: Check if student and institution data exists
      if (studentData && studentData.name && studentData.feeAmount && studentData.institutionId) {
        completedSteps.step1 = true;
        nextStep = 2;
      }

      // Step 2: EMI plan selection (we'll assume it's saved in localStorage for now, or if step 3 data exists)
      if (profile.fullName) {
        completedSteps.step2 = true;
        nextStep = 3;
      }

      // Step 3: Primary Earner (fullName exists)
      if (profile.fullName) {
        completedSteps.step3 = true;
        nextStep = 4; // Welcome page (always go through it)
      }

      // Step 4: Welcome/Intro - always pass through
      if (completedSteps.step3) {
        nextStep = 5;
      }

      // Step 5: Personal Details (check if critical personal info is filled)
      if (profile.applicantPan && profile.gender && profile.fatherName && profile.motherName) {
        completedSteps.step5 = true;
        nextStep = 6; // Final step
      }
    }

    console.log("DEBUG - Onboarding Progress:", {
      hasProfile: !!profile,
      hasStudent: !!studentData,
      profileData: profile ? {
        fullName: profile.fullName,
        applicantPan: profile.applicantPan,
        isOnboardingCompleted: profile.isOnboardingCompleted
      } : null,
      studentData: studentData ? {
        name: studentData.name,
        feeAmount: studentData.feeAmount,
        institutionId: studentData.institutionId
      } : null,
      nextStep,
      completedSteps
    });

    return NextResponse.json({
      profile,
      student: studentData,
      isCompleted: profile?.isOnboardingCompleted || false,
      nextStep,
      completedSteps,
    });
  } catch (error) {
    console.error("Error fetching partial onboarding data:", error);
    return NextResponse.json({
      error: "Internal server error"
    }, { status: 500 });
  }
}