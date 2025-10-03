import { NextRequest, NextResponse } from "next/server";
import { db } from "~/server/db";
import { installment, feeApplication, payment } from "~/server/db/schema";
import { getServerSession } from "~/server/auth";
import { eq } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const params = await context.params;
    const installmentId = params.id;

    // Get the installment
    const inst = await db.query.installment.findFirst({
      where: eq(installment.id, installmentId),
    });

    if (!inst) {
      return NextResponse.json({ error: "Installment not found" }, { status: 404 });
    }

    // Verify ownership through application
    const application = await db.query.feeApplication.findFirst({
      where: eq(feeApplication.id, inst.feeApplicationId),
      with: {
        student: true,
      },
    });

    if (!application || application.student.parentId !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Check if already paid
    if (inst.status === "paid") {
      return NextResponse.json({ error: "Installment already paid" }, { status: 400 });
    }

    // Create payment record (simulated payment)
    const paymentId = uuidv4();
    const transactionId = `TXN${Date.now()}`;

    await db.insert(payment).values({
      id: paymentId,
      amount: inst.amount,
      status: "completed",
      method: "simulated", // Mock payment method
      transactionId: transactionId,
      userId: session.user.id,
      feeApplicationId: inst.feeApplicationId,
      installmentId: inst.id,
      createdAt: new Date(),
    });

    // Update installment status
    await db
      .update(installment)
      .set({
        status: "paid",
        paidDate: new Date(),
        paymentId: paymentId,
        updatedAt: new Date(),
      })
      .where(eq(installment.id, installmentId));

    return NextResponse.json({
      success: true,
      message: "Payment successful",
      transactionId,
      paymentId,
      installmentId,
    });

  } catch (error) {
    console.error("Error processing payment:", error);
    return NextResponse.json({
      error: "Payment failed"
    }, { status: 500 });
  }
}
