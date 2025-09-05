import { NextRequest, NextResponse } from "next/server";
import { db } from "~/server/db";
import { feeStructure, emiPlan, student, institution } from "~/server/db/schema";
import { getServerSession } from "~/server/auth";
import { eq, and } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get parent's students
    const students = await db.query.student.findMany({
      where: eq(student.parentId, session.user.id),
      with: {
        institution: true,
      },
    });

    if (students.length === 0) {
      return NextResponse.json({ 
        availableFees: [],
        emiPlans: []
      });
    }

    // Get all institution IDs for this parent's students
    const institutionIds = students.map(s => s.institutionId);

    // Get available fee structures for these institutions
    const availableFees = await db.query.feeStructure.findMany({
      where: eq(feeStructure.institutionId, institutionIds[0]), // For now, assume one institution
      orderBy: (feeStructure, { desc }) => [desc(feeStructure.createdAt)],
    });

    // Get EMI plans for these fee structures
    const feeStructureIds = availableFees.map(f => f.id);
    const emiPlans = await db.query.emiPlan.findMany({
      where: and(
        eq(emiPlan.isActive, true),
        // TODO: Add proper filtering for fee structure IDs
      ),
      orderBy: (emiPlan, { asc }) => [asc(emiPlan.installments)],
    });

    return NextResponse.json({
      students,
      availableFees,
      emiPlans,
    });
  } catch (error) {
    console.error("Error fetching available fees:", error);
    return NextResponse.json({ 
      error: "Internal server error" 
    }, { status: 500 });
  }
}