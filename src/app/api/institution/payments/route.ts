import { NextRequest, NextResponse } from "next/server";
import { db } from "~/server/db";
import { institutionPayment, feeApplication, payment, member } from "~/server/db/schema";
import { getServerSession } from "~/server/auth";
import { eq, and, desc } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user's institution through membership
    const membership = await db.query.member.findFirst({
      where: eq(member.userId, session.user.id),
      with: {
        organization: {
          with: {
            institutions: true,
          },
        },
      },
    });

    const institutionId = membership?.organization?.institutions[0]?.id;

    // Get institution payments (lump sum payments from platform)
    const institutionPaymentsQuery = institutionId
      ? await db.query.institutionPayment.findMany({
          where: eq(institutionPayment.institutionId, institutionId),
          orderBy: [desc(institutionPayment.createdAt)],
        })
      : [];

    // Get payment records to institution
    const paymentsToInstitution = institutionId
      ? await db.query.payment.findMany({
          where: and(
            eq(payment.institutionId, institutionId),
            eq(payment.paymentType, "platform_to_institution")
          ),
          orderBy: [desc(payment.createdAt)],
        })
      : [];

    // Get EMI applications that are being handled by platform
    const emiApplications = await db.query.feeApplication.findMany({
      where: institutionId
        ? and(
            eq(feeApplication.platformPaidToInstitution, true)
          )
        : eq(feeApplication.platformPaidToInstitution, true),
      with: {
        student: true,
      },
      orderBy: [desc(feeApplication.createdAt)],
    });

    // Calculate summary
    const totalFromInstitutionPayments = institutionPaymentsQuery.reduce(
      (sum, payment) => sum + parseFloat(payment.totalAmount),
      0
    );

    const totalFromPaymentTable = paymentsToInstitution.reduce(
      (sum, p) => sum + parseFloat(p.amount),
      0
    );

    const totalPaymentsReceived = totalFromInstitutionPayments + totalFromPaymentTable;

    const pendingEMIApprovals = emiApplications.filter(app =>
      app.status === "platform_review"
    ).length;

    const activeEMIs = emiApplications.filter(app =>
      app.status === "approved" || app.status === "active"
    ).length;

    const paidToInstitution = emiApplications.filter(app =>
      app.platformPaidToInstitution
    ).length;

    return NextResponse.json({
      payments: institutionPaymentsQuery,
      paymentRecords: paymentsToInstitution,
      emiApplications,
      summary: {
        totalPaymentsReceived,
        pendingEMIApprovals,
        activeEMIs,
        paidToInstitution,
        totalEMIApplications: emiApplications.length,
        institutionId,
      },
    });
  } catch (error) {
    console.error("Error fetching institution payments:", error);
    return NextResponse.json({
      error: "Internal server error",
      details: error instanceof Error ? error.message : String(error),
    }, { status: 500 });
  }
}