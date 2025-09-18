import { redirect } from "next/navigation";
import { getServerSession } from "~/server/auth";
import { headers } from "next/headers";
import { Badge } from "~/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";

interface ApplicationPageProps {
  params: {
    id: string;
  };
}

export default async function ApplicationDetailsPage({ params }: ApplicationPageProps) {
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

  // Mock application data - replace with real data from API
  const mockApplication = {
    id: params.id,
    institution: params.id === "1496252" ? "IISC Bangalore(J)" : "Chinmaya Vishwavidyapeeth",
    academicYear: params.id === "1496252" ? "2024-2025" : "2025-2026",
    studentName: "Cyril Samuel",
    totalFees: params.id === "1496252" ? 123000 : 100000,
    status: params.id === "1496252" ? "emi_pending" : "emi_progress",
    submittedDate: "2024-09-10",
    emiPlan: {
      installments: 6,
      monthlyAmount: params.id === "1496252" ? 20500 : 16666,
      interestRate: 8.5,
      processingFee: 1000
    },
    documents: [
      { name: "Student Admission Letter", status: "verified", uploadedAt: "2024-09-10" },
      { name: "Parent ID Proof", status: "verified", uploadedAt: "2024-09-10" },
      { name: "Income Certificate", status: "pending", uploadedAt: "2024-09-12" },
      { name: "Bank Statement", status: "verified", uploadedAt: "2024-09-11" }
    ],
    paymentSchedule: [
      { month: "September 2024", amount: 20500, dueDate: "2024-09-25", status: "paid" },
      { month: "October 2024", amount: 20500, dueDate: "2024-10-25", status: "upcoming" },
      { month: "November 2024", amount: 20500, dueDate: "2024-11-25", status: "upcoming" },
      { month: "December 2024", amount: 20500, dueDate: "2024-12-25", status: "upcoming" },
      { month: "January 2025", amount: 20500, dueDate: "2025-01-25", status: "upcoming" },
      { month: "February 2025", amount: 20500, dueDate: "2025-02-25", status: "upcoming" }
    ]
  };

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
            <p className="text-gray-600">Application ID: {mockApplication.id}</p>
          </div>
          <Badge
            className={getStatusColor(mockApplication.status)}
          >
            {mockApplication.status === "emi_pending" ? "EMI Setup Required" : "In Progress"}
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
                <div className="font-medium">{mockApplication.institution}</div>
              </div>
              <div>
                <div className="text-gray-600">Academic Year</div>
                <div className="font-medium">{mockApplication.academicYear}</div>
              </div>
              <div>
                <div className="text-gray-600">Student Name</div>
                <div className="font-medium">{mockApplication.studentName}</div>
              </div>
              <div>
                <div className="text-gray-600">Submitted Date</div>
                <div className="font-medium">{mockApplication.submittedDate}</div>
              </div>
            </div>
            <div className="pt-2 border-t">
              <div className="text-gray-600 text-sm">Total Fees</div>
              <div className="text-2xl font-bold text-green-600">
                ₹{mockApplication.totalFees.toLocaleString()}
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
                <div className="font-medium">{mockApplication.emiPlan.installments}</div>
              </div>
              <div>
                <div className="text-gray-600">Monthly Amount</div>
                <div className="font-medium">₹{mockApplication.emiPlan.monthlyAmount.toLocaleString()}</div>
              </div>
              <div>
                <div className="text-gray-600">Interest Rate</div>
                <div className="font-medium">{mockApplication.emiPlan.interestRate}% p.a.</div>
              </div>
              <div>
                <div className="text-gray-600">Processing Fee</div>
                <div className="font-medium">₹{mockApplication.emiPlan.processingFee.toLocaleString()}</div>
              </div>
            </div>
            {mockApplication.status === "emi_pending" && (
              <div className="pt-4">
                <Button className="w-full bg-orange-600 hover:bg-orange-700">
                  Complete EMI Setup
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Document Status */}
        <Card>
          <CardHeader>
            <CardTitle>Document Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {mockApplication.documents.map((doc, index) => (
                <div key={index} className="flex items-center justify-between py-2 border-b last:border-b-0">
                  <div>
                    <div className="font-medium text-sm">{doc.name}</div>
                    <div className="text-xs text-gray-500">Uploaded: {doc.uploadedAt}</div>
                  </div>
                  <Badge className={getStatusColor(doc.status)}>
                    {doc.status.charAt(0).toUpperCase() + doc.status.slice(1)}
                  </Badge>
                </div>
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
            <div className="space-y-3">
              {mockApplication.paymentSchedule.map((payment, index) => (
                <div key={index} className="flex items-center justify-between py-2 border-b last:border-b-0">
                  <div>
                    <div className="font-medium text-sm">{payment.month}</div>
                    <div className="text-xs text-gray-500">Due: {payment.dueDate}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">₹{payment.amount.toLocaleString()}</div>
                    <Badge className={getStatusColor(payment.status)}>
                      {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                    </Badge>
                  </div>
                </div>
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