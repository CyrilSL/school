import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "~/server/auth";
import { db } from "~/server/db";
import { payment, feeApplication, installment, institutionPayment, institution } from "~/server/db/schema";
import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";

/**
 * POST /api/parent/payment/initiate
 * Initiates the payment process after application submission
 * Flow:
 * 1. Parent pays full amount to platform (mocked)
 * 2. Platform pays full amount to institution (mocked)
 * 3. Generate EMI schedule for parent to pay platform back
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { feeApplicationId } = body;

    if (!feeApplicationId) {
      return NextResponse.json(
        { error: "Fee application ID is required" },
        { status: 400 }
      );
    }

    // Fetch the fee application
    const feeApp = await db.query.feeApplication.findFirst({
      where: eq(feeApplication.id, feeApplicationId),
      with: {
        student: {
          with: {
            parent: true,
          },
        },
      },
    });

    if (!feeApp) {
      return NextResponse.json(
        { error: "Fee application not found" },
        { status: 404 }
      );
    }

    // Verify the user owns this application
    if (feeApp.student?.parentId !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const totalAmount = parseFloat(feeApp.totalAmount);
    const monthlyInstallment = feeApp.monthlyInstallment
      ? parseFloat(feeApp.monthlyInstallment)
      : 0;

    // Get EMI plan details
    const emiPlanData = feeApp.emiPlanId
      ? await db.query.emiPlan.findFirst({
          where: (emiPlan, { eq }) => eq(emiPlan.id, feeApp.emiPlanId!),
        })
      : null;

    const numberOfInstallments = emiPlanData?.installments || 6;

    // Step 1: Create payment record for parent -> platform (institution_payment)
    const parentPaymentId = nanoid();
    const transactionId = `TXN-${Date.now()}-${nanoid(6)}`;

    await db.insert(payment).values({
      id: parentPaymentId,
      amount: feeApp.totalAmount,
      paymentType: "institution_payment",
      paymentMethod: "mock_payment",
      status: "completed",
      userId: session.user.id,
      feeApplicationId: feeApp.id,
      institutionId: feeApp.student!.institutionId,
      transactionId,
      paymentGateway: "mock_gateway",
      paymentDate: new Date(),
      notes: "Parent paid full amount to platform (mock payment)",
      metadata: {
        processingFee: 0,
        emiDuration: numberOfInstallments,
        emiMonthlyAmount: monthlyInstallment,
      },
      createdAt: new Date(),
    });

    // Step 2: Platform pays institution (mock)
    const platformPaymentId = nanoid();
    const platformTransactionId = `PLTF-${Date.now()}-${nanoid(6)}`;

    await db.insert(payment).values({
      id: platformPaymentId,
      amount: feeApp.totalAmount,
      paymentType: "platform_to_institution",
      paymentMethod: "bank_transfer",
      status: "completed",
      institutionId: feeApp.student!.institutionId,
      feeApplicationId: feeApp.id,
      transactionId: platformTransactionId,
      paymentGateway: "mock_gateway",
      paymentDate: new Date(),
      notes: "Platform paid full amount to institution (mock payment)",
      createdAt: new Date(),
    });

    // Also create institutionPayment record
    await db.insert(institutionPayment).values({
      id: nanoid(),
      institutionId: feeApp.student!.institutionId,
      feeApplicationIds: JSON.stringify([feeApp.id]),
      totalAmount: feeApp.totalAmount,
      paymentDate: new Date(),
      paymentMethod: "bank_transfer",
      transactionId: platformTransactionId,
      status: "completed",
      notes: "Automated payment from platform to institution",
      createdAt: new Date(),
    });

    // Step 3: Generate EMI schedule for parent
    const installments = [];
    const installmentAmount = Math.ceil(totalAmount / numberOfInstallments);
    const startDate = new Date();

    for (let i = 0; i < numberOfInstallments; i++) {
      const dueDate = new Date(startDate);
      dueDate.setMonth(dueDate.getMonth() + i + 1); // Start from next month

      installments.push({
        id: nanoid(),
        feeApplicationId: feeApp.id,
        installmentNumber: i + 1,
        amount: i === numberOfInstallments - 1
          ? (totalAmount - installmentAmount * (numberOfInstallments - 1)).toFixed(2) // Last installment adjusts for rounding
          : installmentAmount.toFixed(2),
        dueDate,
        status: "pending" as const,
        createdAt: new Date(),
      });
    }

    await db.insert(installment).values(installments);

    // Step 4: Update fee application status
    await db
      .update(feeApplication)
      .set({
        status: "active",
        platformPaidToInstitution: true,
        institutionPaymentDate: new Date(),
      })
      .where(eq(feeApplication.id, feeApp.id));

    return NextResponse.json({
      success: true,
      message: "Payment processed successfully",
      data: {
        parentPaymentId,
        platformPaymentId,
        transactionId,
        platformTransactionId,
        installments: installments.length,
        totalAmount: feeApp.totalAmount,
        monthlyInstallment: installmentAmount,
      },
    });
  } catch (error) {
    console.error("Error processing payment:", error);
    return NextResponse.json(
      { error: "Failed to process payment", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}