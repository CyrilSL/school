import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "~/server/auth";
import { db } from "~/server/db";
import { feeApplication, installment } from "~/server/db/schema";
import { eq } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";

export async function PATCH(
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
    const body = await request.json();
    const { action } = body; // "approve" or "reject"

    if (!action || !["approve", "reject"].includes(action)) {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

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

    // Update application status
    const updateData: any = {
      updatedAt: new Date(),
    };

    if (action === "approve") {
      updateData.status = "approved";
      updateData.approvedAt = new Date();

      // Generate installments when approving
      if (application.emiPlan && application.monthlyInstallment) {
        console.log('Generating installments for application:', applicationId);
        console.log('EMI Plan:', application.emiPlan);
        console.log('Monthly Installment:', application.monthlyInstallment);

        const approvalDate = new Date();
        const installmentsToCreate = [];

        for (let i = 0; i < application.emiPlan.installments; i++) {
          // Calculate due date: first day of each month starting from next month
          const dueDate = new Date(approvalDate);
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

        console.log(`Creating ${installmentsToCreate.length} installments`);

        // Insert all installments
        if (installmentsToCreate.length > 0) {
          await db.insert(installment).values(installmentsToCreate);
          console.log('Installments created successfully');
        }
      } else {
        console.log('Cannot generate installments - missing EMI plan or monthly installment');
        console.log('Has EMI Plan:', !!application.emiPlan);
        console.log('Has Monthly Installment:', !!application.monthlyInstallment);
      }
    } else if (action === "reject") {
      updateData.status = "rejected";
      updateData.rejectedAt = new Date();
    }

    await db
      .update(feeApplication)
      .set(updateData)
      .where(eq(feeApplication.id, applicationId));

    return NextResponse.json({
      success: true,
      message: `Application ${action}d successfully`,
      applicationId,
      newStatus: updateData.status,
    });

  } catch (error) {
    console.error("Error updating application:", error);
    return NextResponse.json(
      { error: "Failed to update application" },
      { status: 500 }
    );
  }
}
