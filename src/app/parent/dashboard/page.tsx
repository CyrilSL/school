import { redirect } from "next/navigation";
import { getServerSession } from "~/server/auth";
import { headers } from "next/headers";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";

interface FeeApplication {
  id: string;
  institution: string;
  academicYear: string;
  studentName: string;
  totalFees: number;
  status: string;
  statusText: string;
  actionText: string;
  actionUrl: string;
  appliedAt?: string;
  emiPlan?: {
    name: string;
    installments: number;
    monthlyAmount: number;
    interestRate: number;
  } | null;
}

export default async function ParentDashboard() {
  // Server-side authentication check (same as homepage)
  const session = await getServerSession();
  
  if (!session?.user) {
    redirect("/login/parent");
  }

  // Fetch real applications from API
  let applications: FeeApplication[] = [];
  let isOnboardingCompleted = false;

  try {
    const headersList = await headers();
    const host = headersList.get('host') || 'localhost:3000';
    const protocol = host.includes('localhost') ? 'http' : 'https';
    const cookie = headersList.get('cookie') || '';

    const applicationsResponse = await fetch(`${protocol}://${host}/api/parent/applications`, {
      headers: {
        'Cookie': cookie,
      },
    });

    if (applicationsResponse.ok) {
      const data = await applicationsResponse.json();
      applications = data.applications || [];
      isOnboardingCompleted = data.isOnboardingCompleted || false;
    }
  } catch (error) {
    console.error('Error fetching applications:', error);
  }

  // If no applications exist, redirect to onboarding
  if (applications.length === 0) {
    redirect("/parent/apply");
  }

  return (
    <div className="w-full">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Applications</h1>
            <p className="text-gray-600">Manage your fee applications and EMI plans</p>
          </div>
          <Button asChild className="bg-blue-600 hover:bg-blue-700 text-white">
            <a href="/parent/apply">+ New Application</a>
          </Button>
        </div>
      </div>

      {/* Application Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {applications.map((application) => (
          <Card key={application.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-sm text-gray-600 mb-1">Application ID: {application.id}</div>
                  <CardTitle className="text-lg leading-tight">{application.institution}</CardTitle>
                </div>
                <Badge
                  variant={
                    application.status === "emi_pending" || application.status === "onboarding_pending"
                      ? "destructive"
                      : application.status === "completed"
                      ? "default"
                      : "secondary"
                  }
                  className="ml-2"
                >
                  {application.status === "emi_pending" || application.status === "onboarding_pending"
                    ? "Action Required"
                    : application.status === "completed"
                    ? "Completed"
                    : "In Progress"}
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <Card>
                  <CardContent className="p-4">
                    <div className="text-xs text-gray-600">Academic Year</div>
                    <div className="font-medium text-sm">{application.academicYear}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="text-xs text-gray-600">Student Name</div>
                    <div className="font-medium text-sm">{application.studentName}</div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardContent className="p-4">
                  <div className="text-xs text-gray-600">Total Fees</div>
                  <div className="text-xl font-bold text-green-600">
                    ₹{application.totalFees.toLocaleString()}
                  </div>
                </CardContent>
              </Card>
            </CardContent>

            <div className="p-6 pt-0">
              <div className="text-sm text-gray-700 mb-3">{application.statusText}</div>
              <Button
                asChild
                className={`w-full text-white ${
                  application.status === "emi_pending" || application.status === "onboarding_pending"
                    ? "bg-orange-600 hover:bg-orange-700"
                    : application.status === "completed"
                    ? "bg-green-600 hover:bg-green-700"
                    : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                <a href={application.actionUrl}>{application.actionText}</a>
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* If no applications */}
      {applications.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-500 mb-4">No applications found</div>
          <Button asChild>
            <a href="/parent/apply">Create New Application</a>
          </Button>
        </div>
      )}

    </div>
  );
}
