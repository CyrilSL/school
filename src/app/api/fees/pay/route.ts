import { NextRequest, NextResponse } from "next/server";
import { db } from "~/server/db";
import { installment, feeApplication, student } from "~/server/db/schema";
import { getServerSession } from "~/server/auth";
import { eq, and, sql } from "drizzle-orm";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { installmentId, paymentMethod = "demo" } = body;

    if (!installmentId) {
      return NextResponse.json({ error: "Installment ID required" }, { status: 400 });
    }

    // Get installment with application details
    const installmentRecord = await db.query.installment.findFirst({
      where: eq(installment.id, installmentId),
      with: {
        feeApplication: {
          with: {
            student: true,
          },
        },
      },
    });

    if (!installmentRecord) {
      return NextResponse.json({ error: "Installment not found" }, { status: 404 });
    }

    // Verify installment belongs to this parent's student
    if (installmentRecord.feeApplication.student.parentId !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Check if already paid
    if (installmentRecord.status === "paid") {
      return NextResponse.json({ error: "Installment already paid" }, { status: 400 });
    }

    // TODO: Integrate with actual payment gateway
    // For now, simulate payment processing
    const paymentId = `demo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    await db.transaction(async (tx) => {
      // Update installment status
      await tx
        .update(installment)
        .set({
          status: "paid",
          paidDate: new Date(),
          paymentId,
        })
        .where(eq(installment.id, installmentId));

      // Update remaining amount in fee application
      const paidAmount = parseFloat(installmentRecord.amount);
      await tx
        .update(feeApplication)
        .set({
          remainingAmount: sql`remaining_amount - ${paidAmount}`,
        })
        .where(eq(feeApplication.id, installmentRecord.feeApplicationId));
    });

    return NextResponse.json({ 
      success: true,
      paymentId,
      message: "Payment processed successfully"
    });
  } catch (error) {
    console.error("Error processing payment:", error);
    return NextResponse.json({ 
      error: "Internal server error" 
    }, { status: 500 });
  }
}