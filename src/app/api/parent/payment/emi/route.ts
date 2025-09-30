import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "~/server/auth";
import { db } from "~/server/db";
import { payment, installment, feeApplication } from "~/server/db/schema";
import { eq, and } from "drizzle-orm";
import { nanoid } from "nanoid";

/**
 * POST /api/parent/payment/emi
 * Pays a single EMI installment
 * Flow: Parent pays installment to loan provider (mocked)
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { installmentId } = body;

    if (!installmentId) {
      return NextResponse.json(
        { error: "Installment ID is required" },
        { status: 400 }
      );
    }

    // Fetch the installment
    const inst = await db.query.installment.findFirst({
      where: eq(installment.id, installmentId),
    });

    if (!inst) {
      return NextResponse.json(
        { error: "Installment not found" },
        { status: 404 }
      );
    }

    // Check if already paid
    if (inst.status === "paid") {
      return NextResponse.json(
        { error: "Installment already paid" },
        { status: 400 }
      );
    }

    // Fetch fee application to verify ownership
    const feeApp = await db.query.feeApplication.findFirst({
      where: eq(feeApplication.id, inst.feeApplicationId),
      with: {
        student: true,
      },
    });

    if (!feeApp || feeApp.student?.parentId !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Create payment record
    const paymentId = nanoid();
    const transactionId = `EMI-${Date.now()}-${nanoid(6)}`;

    await db.insert(payment).values({
      id: paymentId,
      amount: inst.amount,
      paymentType: "emi_payment",
      paymentMethod: "mock_payment",
      status: "completed",
      userId: session.user.id,
      feeApplicationId: inst.feeApplicationId,
      installmentId: inst.id,
      transactionId,
      paymentGateway: "mock_gateway",
      paymentDate: new Date(),
      notes: `EMI payment for installment #${inst.installmentNumber} (mock payment to loan provider)`,
      createdAt: new Date(),
    });

    // Update installment status
    await db
      .update(installment)
      .set({
        status: "paid",
        paidDate: new Date(),
        paymentId,
      })
      .where(eq(installment.id, inst.id));

    // Update fee application remaining amount
    const remaining = parseFloat(feeApp.remainingAmount) - parseFloat(inst.amount);
    await db
      .update(feeApplication)
      .set({
        remainingAmount: remaining.toFixed(2),
        status: remaining <= 0 ? "completed" : "active",
      })
      .where(eq(feeApplication.id, inst.feeApplicationId));

    return NextResponse.json({
      success: true,
      message: "EMI payment successful",
      data: {
        paymentId,
        transactionId,
        installmentNumber: inst.installmentNumber,
        amount: inst.amount,
        remainingAmount: remaining.toFixed(2),
      },
    });
  } catch (error) {
    console.error("Error processing EMI payment:", error);
    return NextResponse.json(
      { error: "Failed to process EMI payment", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

/**
 * GET /api/parent/payment/emi?feeApplicationId=xxx
 * Gets all EMI installments for a fee application
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const feeApplicationId = searchParams.get("feeApplicationId");

    if (!feeApplicationId) {
      return NextResponse.json(
        { error: "Fee application ID is required" },
        { status: 400 }
      );
    }

    // Verify ownership
    const feeApp = await db.query.feeApplication.findFirst({
      where: eq(feeApplication.id, feeApplicationId),
      with: {
        student: true,
      },
    });

    if (!feeApp || feeApp.student?.parentId !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Fetch all installments
    const installments = await db.query.installment.findMany({
      where: eq(installment.feeApplicationId, feeApplicationId),
      orderBy: (installment, { asc }) => [asc(installment.installmentNumber)],
    });

    return NextResponse.json({
      success: true,
      installments,
      summary: {
        total: installments.length,
        paid: installments.filter(i => i.status === "paid").length,
        pending: installments.filter(i => i.status === "pending").length,
        overdue: installments.filter(i => i.status === "overdue").length,
        totalAmount: installments.reduce((sum, i) => sum + parseFloat(i.amount), 0),
        paidAmount: installments
          .filter(i => i.status === "paid")
          .reduce((sum, i) => sum + parseFloat(i.amount), 0),
      },
    });
  } catch (error) {
    console.error("Error fetching EMI installments:", error);
    return NextResponse.json(
      { error: "Failed to fetch EMI installments" },
      { status: 500 }
    );
  }
}