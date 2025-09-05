import { NextRequest, NextResponse } from "next/server";
import { db } from "~/server/db";
import { parentProfile, student, institution, organization } from "~/server/db/schema";
import { getServerSession } from "~/server/auth";
import { eq, and } from "drizzle-orm";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      fullName,
      phone,
      address,
      panCardNumber,
      alternateEmail,
      occupation,
      annualIncome,
      emergencyContactName,
      emergencyContactPhone,
      relationToStudent,
      studentName,
      studentClass,
      studentSection,
      institutionName,
    } = body;

    // Validate required fields
    if (!fullName || !phone || !address || !panCardNumber || !relationToStudent || !studentName || !institutionName) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Check if parent profile already exists
    const existingProfile = await db.query.parentProfile.findFirst({
      where: eq(parentProfile.userId, session.user.id),
    });

    if (existingProfile) {
      return NextResponse.json({ error: "Onboarding already completed" }, { status: 400 });
    }

    // Start transaction to create parent profile and student
    const result = await db.transaction(async (tx) => {
      // Create parent profile
      const [newParentProfile] = await tx.insert(parentProfile).values({
        id: crypto.randomUUID(),
        userId: session.user.id,
        fullName,
        phone,
        address,
        panCardNumber,
        alternateEmail: alternateEmail || null,
        occupation: occupation || null,
        annualIncome: annualIncome ? parseFloat(annualIncome) : null,
        emergencyContactName: emergencyContactName || null,
        emergencyContactPhone: emergencyContactPhone || null,
        relationToStudent,
        isOnboardingCompleted: true,
        createdAt: new Date(),
      }).returning();

      // Find or create institution
      let institutionId: string;
      
      // First, try to find existing institution by name
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
          createdAt: new Date(),
        }).returning();

        institutionId = newInstitution.id;
      }

      // Create student record
      const [newStudent] = await tx.insert(student).values({
        id: crypto.randomUUID(),
        parentId: session.user.id,
        institutionId,
        name: studentName,
        class: studentClass || null,
        section: studentSection || null,
        admissionDate: new Date(),
        createdAt: new Date(),
      }).returning();

      return {
        parentProfile: newParentProfile,
        student: newStudent,
      };
    });

    return NextResponse.json({ 
      success: true,
      data: result
    });
  } catch (error) {
    console.error("Error in parent onboarding:", error);
    return NextResponse.json({ 
      error: "Internal server error" 
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