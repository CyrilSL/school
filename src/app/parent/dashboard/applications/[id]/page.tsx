import { redirect } from "next/navigation";
import { getServerSession } from "~/server/auth";
import { headers } from "next/headers";
import { Badge } from "~/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";

export default async function ApplicationDetailsPage(context: { params: { id: string } }) {
  const { params } = context;
  const session = await getServerSession();

  if (!session?.user) {
    redirect("/login/parent");
  }

  // Check onboarding completion
  let onboardingProgress = null;
  try {
    const headersList = await headers();
    const host = headersList.get('host') || 'localhost:3000';
    const protocol = host.includes('localhost') ? 'http' : 'https';
    const cookie = headersList.get('cookie') || '';

    const progressResponse = await fetch(`${protocol}://${host}/api/parent/onboarding/partial`, {
      headers: {
        'Cookie': cookie,
      },
    });

    if (progressResponse.ok) {
      onboardingProgress = await progressResponse.json();
    }
  } catch (error) {
    console.error('Error fetching onboarding progress:', error);
  }

  // If onboarding is not completed, redirect to onboarding
  if (!onboardingProgress?.isCompleted) {
    const nextStep = onboardingProgress?.nextStep || 1;
    redirect(`/parent/onboarding/steps/${nextStep}`);
  }


  // Get application details from backend API (SSR, use fetch)
  let application = null;
  let installments = [];
  let fetchError = null;
  try {
    // Get application data
    const headersList = await headers();
    const host = headersList.get('host') || 'localhost:3000';
    const protocol = host.includes('localhost') ? 'http' : 'https';
    const cookie = headersList.get('cookie') || '';

    // Fee application by id for this parent (with relations)
    const appRes = await fetch(
      `${protocol}://${host}/api/fees/applications/${params.id}`,
      { headers: { 'Cookie': cookie }, cache: 'no-store' } // SSR only
    );
    if (appRes.ok) {
      application = await appRes.json();
    } else {
      fetchError = 'Unable to fetch application data.';
    }

    // Get installments if application found
    if (application && application.id) {
      const insRes = await fetch(
        `${protocol}://${host}/api/fees/installments?applicationId=${application.id}`,
        { headers: { 'Cookie': cookie }, cache: 'no-store' }
      );
      if (insRes.ok) {
        const insJson = await insRes.json();
        installments = insJson.installments || [];
      }
    }
  } catch (err) {
    console.error('Fetch error', err);
    fetchError = 'Server error fetching data.';
  }

  if (fetchError) {
    return (
      <div className="max-w-4xl mx-auto p-12 text-center">
        <h2 className="text-xl font-bold mb-4">Error</h2>
        <p>{fetchError}</p>
      </div>
    );
  }
  if (!application) {
    return (
      <div className="max-w-4xl mx-auto p-12 text-center">
        <h2 className="text-xl font-bold mb-4">Not Found</h2>
        <p>No application found for this ID.</p>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "verified":
      case "paid":
        return "bg-green-100 text-green-800";
      case "pending":
      case "upcoming":
        return "bg-yellow-100 text-yellow-800";
      case "rejected":
      case "overdue":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="max-w-6xl">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Application Details</h1>
            <p className="text-gray-600">Application ID: {application.id}</p>
          </div>
          <Badge className={getStatusColor(application.status)}>
            {application.status === "emi_pending" ? "EMI Setup Required" : "In Progress"}
          </Badge>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Application Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Application Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-gray-600">Institution</div>
                <div className="font-medium">{application.feeStructure?.name || '-'}</div>
              </div>
              <div>
                <div className="text-gray-600">Academic Year</div>
                <div className="font-medium">{application.feeStructure?.academicYear || '-'}</div>
              </div>
              <div>
                <div className="text-gray-600">Student Name</div>
                <div className="font-medium">{application.student?.name || '-'}</div>
              </div>
              <div>
                <div className="text-gray-600">Submitted Date</div>
                <div className="font-medium">{application.appliedAt ? new Date(application.appliedAt).toLocaleDateString() : '-'}</div>
              </div>
            </div>
            <div className="pt-2 border-t">
              <div className="text-gray-600 text-sm">Total Fees</div>
              <div className="text-2xl font-bold text-green-600">
                ₹{Number(application.totalAmount).toLocaleString()}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* EMI Plan Details */}
        <Card>
          <CardHeader>
            <CardTitle>EMI Plan Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-gray-600">No. of Installments</div>
                <div className="font-medium">{application.emiPlan?.installments || '-'}</div>
              </div>
              <div>
                <div className="text-gray-600">Monthly Amount</div>
                <div className="font-medium">₹{application.monthlyInstallment ? Number(application.monthlyInstallment).toLocaleString() : '-'}</div>
              </div>
              <div>
                <div className="text-gray-600">Interest Rate</div>
                <div className="font-medium">{application.emiPlan?.interestRate || '-'}% p.a.</div>
              </div>
              <div>
                <div className="text-gray-600">Processing Fee</div>
                <div className="font-medium">₹{application.emiPlan?.processingFee ? Number(application.emiPlan.processingFee).toLocaleString() : '-'}</div>
              </div>
            </div>
          </CardContent>
          {application.status === "emi_pending" && (
            <div className="p-6 pt-0">
              <Button className="w-full bg-orange-600 hover:bg-orange-700">
                Complete EMI Setup
              </Button>
            </div>
          )}
        </Card>

        {/* Document Status (Placeholder, real docs integration needed) */}
        <Card>
          <CardHeader>
            <CardTitle>Document Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              {mockApplication.documents.map((doc, index) => (
                <Card key={index}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="font-medium text-sm">{doc.name}</div>
                        <div className="text-xs text-gray-500 mt-1">Uploaded: {doc.uploadedAt}</div>
                      </div>
                      <Badge className={getStatusColor(doc.status)}>
                        {doc.status.charAt(0).toUpperCase() + doc.status.slice(1)}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Payment Schedule */}
        <Card>
          <CardHeader>
            <CardTitle>Payment Schedule</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              {mockApplication.paymentSchedule.map((payment, index) => (
                <Card key={index}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="font-medium text-sm">{payment.month}</div>
                        <div className="text-xs text-gray-500 mt-1">Due: {payment.dueDate}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">₹{payment.amount.toLocaleString()}</div>
                        <Badge className={getStatusColor(payment.status)}>
                          {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="mt-8 flex gap-4">
        <Button variant="outline" asChild>
          <a href="/parent/dashboard">Back to Applications</a>
        </Button>
        {mockApplication.status === "emi_pending" && (
          <Button className="bg-orange-600 hover:bg-orange-700">
            Complete EMI Form
          </Button>
        )}
        <Button variant="outline">
          Download Details
        </Button>
      </div>
    </div>
  );
}
