import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "~/server/auth";
import { db } from "~/server/db";
import { feeApplication, installment } from "~/server/db/schema";
import { eq } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession();

    if (!session?.user?.id || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const params = await context.params;
    const applicationId = params.id;

    // Get the application with EMI plan details
    const application = await db.query.feeApplication.findFirst({
      where: eq(feeApplication.id, applicationId),
      with: {
        emiPlan: true,
      },
    });

    if (!application) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 });
    }

    if (!application.emiPlan || !application.monthlyInstallment) {
      return NextResponse.json({
        error: "Application does not have EMI plan or monthly installment"
      }, { status: 400 });
    }

    // Check if installments already exist
    const existingInstallments = await db.query.installment.findMany({
      where: eq(installment.feeApplicationId, applicationId),
    });

    if (existingInstallments.length > 0) {
      return NextResponse.json({
        error: "Installments already exist for this application",
        count: existingInstallments.length
      }, { status: 400 });
    }

    // Generate installments
    const baseDate = application.approvedAt || new Date();
    const installmentsToCreate = [];

    for (let i = 0; i < application.emiPlan.installments; i++) {
      // Calculate due date: first day of each month starting from next month
      const dueDate = new Date(baseDate);
      dueDate.setMonth(dueDate.getMonth() + i + 1);
      dueDate.setDate(1); // First day of month
      dueDate.setHours(0, 0, 0, 0);

      installmentsToCreate.push({
        id: uuidv4(),
        feeApplicationId: applicationId,
        installmentNumber: i + 1,
        amount: application.monthlyInstallment,
        dueDate: dueDate,
        status: "pending",
        createdAt: new Date(),
      });
    }

    // Insert all installments
    await db.insert(installment).values(installmentsToCreate);

    return NextResponse.json({
      success: true,
      message: `Generated ${installmentsToCreate.length} installments`,
      count: installmentsToCreate.length,
    });

  } catch (error) {
    console.error("Error generating installments:", error);
    return NextResponse.json(
      { error: "Failed to generate installments" },
      { status: 500 }
    );
  }
}
