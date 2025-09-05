import { NextRequest, NextResponse } from "next/server";
import { db } from "~/server/db";
import { feeApplication, student, feeStructure, emiPlan, installment } from "~/server/db/schema";
import { getServerSession } from "~/server/auth";
import { eq, and, desc } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get parent's students
    const students = await db.query.student.findMany({
      where: eq(student.parentId, session.user.id),
    });

    if (students.length === 0) {
      return NextResponse.json({ applications: [] });
    }

    const studentIds = students.map(s => s.id);

    // Get all fee applications for parent's students
    const applications = await db.query.feeApplication.findMany({
      where: eq(feeApplication.studentId, studentIds[0]), // For now, get for first student
      with: {
        student: true,
        feeStructure: true,
        emiPlan: true,
      },
      orderBy: [desc(feeApplication.createdAt)],
    });

    return NextResponse.json({ applications });
  } catch (error) {
    console.error("Error fetching fee applications:", error);
    return NextResponse.json({ 
      error: "Internal server error" 
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { studentId, feeStructureId, emiPlanId } = body;

    // Validate request
    if (!studentId || !feeStructureId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Verify student belongs to this parent
    const studentRecord = await db.query.student.findFirst({
      where: and(
        eq(student.id, studentId),
        eq(student.parentId, session.user.id)
      ),
    });

    if (!studentRecord) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    // Get fee structure
    const feeStructureRecord = await db.query.feeStructure.findFirst({
      where: eq(feeStructure.id, feeStructureId),
    });

    if (!feeStructureRecord) {
      return NextResponse.json({ error: "Fee structure not found" }, { status: 404 });
    }

    let monthlyInstallment = null;
    let emiPlanRecord = null;

    if (emiPlanId) {
      emiPlanRecord = await db.query.emiPlan.findFirst({
        where: eq(emiPlan.id, emiPlanId),
      });

      if (!emiPlanRecord) {
        return NextResponse.json({ error: "EMI plan not found" }, { status: 404 });
      }

      monthlyInstallment = parseFloat(feeStructureRecord.amount) / emiPlanRecord.installments;
    }

    // Create fee application
    const [newApplication] = await db.insert(feeApplication).values({
      id: crypto.randomUUID(),
      studentId,
      feeStructureId,
      emiPlanId: emiPlanId || null,
      totalAmount: feeStructureRecord.amount,
      remainingAmount: feeStructureRecord.amount,
      monthlyInstallment: monthlyInstallment?.toString() || null,
      appliedAt: new Date(),
      createdAt: new Date(),
    }).returning();

    // If EMI plan selected, create installments
    if (emiPlanRecord && monthlyInstallment) {
      const installments = [];
      const now = new Date();
      
      for (let i = 1; i <= emiPlanRecord.installments; i++) {
        const dueDate = new Date(now);
        dueDate.setMonth(dueDate.getMonth() + i);
        
        installments.push({
          id: crypto.randomUUID(),
          feeApplicationId: newApplication.id,
          installmentNumber: i,
          amount: monthlyInstallment.toString(),
          dueDate,
          createdAt: new Date(),
        });
      }
      
      await db.insert(installment).values(installments);
    }

    return NextResponse.json({ 
      success: true,
      application: newApplication
    });
  } catch (error) {
    console.error("Error creating fee application:", error);
    return NextResponse.json({ 
      error: "Internal server error" 
    }, { status: 500 });
  }
}