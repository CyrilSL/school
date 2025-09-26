import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "~/server/auth";
import { db } from "~/server/db";
import { installment, feeApplication, student, institution } from "~/server/db/schema";
import { eq } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get all installments for this parent's students
    const transactions = await db
      .select({
        id: installment.id,
        amount: installment.amount,
        status: installment.status,
        dueDate: installment.dueDate,
        paidDate: installment.paidDate,
        installmentNumber: installment.installmentNumber,
        paymentId: installment.paymentId,
        // Application info
        applicationId: feeApplication.id,
        // Student info
        studentName: student.name,
        // Institution info
        institutionName: institution.name,
      })
      .from(installment)
      .innerJoin(feeApplication, eq(installment.feeApplicationId, feeApplication.id))
      .innerJoin(student, eq(feeApplication.studentId, student.id))
      .innerJoin(institution, eq(student.institutionId, institution.id))
      .where(eq(student.parentId, session.user.id))
      .orderBy(installment.dueDate);

    // Transform the data to match the frontend format
    const transformedTransactions = transactions.map((txn) => ({
      id: txn.paymentId || `INS-${txn.id}`,
      applicationId: txn.applicationId,
      amount: Number(txn.amount),
      status: txn.status, // 'pending', 'paid', 'overdue'
      date: (txn.paidDate || txn.dueDate)?.toISOString().split('T')[0],
      description: `EMI Payment ${txn.installmentNumber} - ${txn.institutionName}`,
      paymentMethod: getPaymentMethod(txn.status, txn.paymentId),
    }));

    return NextResponse.json({
      transactions: transformedTransactions,
    });

  } catch (error) {
    console.error("Error fetching transactions:", error);
    return NextResponse.json(
      { error: "Failed to fetch transactions" },
      { status: 500 }
    );
  }
}

function getPaymentMethod(status: string, paymentId: string | null): string {
  if (status === "paid" && paymentId) {
    // In a real system, you'd determine this from payment gateway data
    // For now, return a default
    return "UPI";
  }
  if (status === "pending") {
    return "Auto Debit";
  }
  return "Unknown";
}