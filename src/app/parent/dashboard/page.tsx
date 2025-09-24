import { redirect } from "next/navigation";
import { getServerSession } from "~/server/auth";
import { headers } from "next/headers";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Progress } from "~/components/ui/progress";

interface Student {
  id: string;
  name: string;
  rollNumber: string;
  class: string;
  section: string;
  institution: string;
}

interface FeeStructure {
  id: string;
  name: string;
  amount: number;
  dueDate: string;
  academicYear: string;
}

interface EmiPlan {
  id: string;
  name: string;
  installments: number;
  monthlyAmount: number;
  interestRate: number;
}

interface FeeApplication {
  id: string;
  feeStructure: FeeStructure;
  emiPlan: EmiPlan;
  status: "pending" | "approved" | "rejected";
  appliedAt: string;
}

export default async function ParentDashboard() {
  // Server-side authentication check (same as homepage)
  const session = await getServerSession();
  
  if (!session?.user) {
    redirect("/login/parent");
  }

  // For now, let the dashboard load and handle onboarding check client-side
  // The server-side check was causing 401 errors
  // TODO: Implement proper server-side onboarding check later

  // Fetch real data from API
  let students: Student[] = [];
  let availableFees: FeeStructure[] = [];
  let emiPlans: EmiPlan[] = [];
  let applications: FeeApplication[] = [];
  let onboardingProgress = null;

  try {
    // Get onboarding progress to show submitted forms
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


  // Mock application data - replace with real data from API
  const mockApplications = [
    {
      id: "1496252",
      institution: "IISC Bangalore(J)",
      academicYear: "2024-2025",
      studentName: "Cyril Samuel",
      totalFees: 123000,
      status: "emi_pending",
      statusText: onboardingProgress?.isCompleted
        ? "Please complete your EMI form"
        : "Please complete your EMI form",
      actionText: "Complete now",
      actionUrl: onboardingProgress?.isCompleted
        ? "/parent/dashboard/applications/1496252"
        : `/parent/onboarding/steps/${onboardingProgress?.nextStep || 1}`
    },
    {
      id: "1474706",
      institution: "Chinmaya Vishwavidyapeeth",
      academicYear: "2025-2026",
      studentName: "Cyril Samuel",
      totalFees: 100000,
      status: "emi_progress",
      statusText: "Your EMI registration is in progress",
      actionText: "View Details",
      actionUrl: onboardingProgress?.isCompleted
        ? "/parent/dashboard/applications/1474706"
        : `/parent/onboarding/steps/${onboardingProgress?.nextStep || 1}`
    }
  ];

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
        {mockApplications.map((application) => (
          <Card key={application.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-sm text-gray-600 mb-1">Application ID: {application.id}</div>
                  <CardTitle className="text-lg leading-tight">{application.institution}</CardTitle>
                </div>
                <Badge
                  variant={application.status === "emi_pending" ? "destructive" : "secondary"}
                  className="ml-2"
                >
                  {application.status === "emi_pending" ? "Action Required" : "In Progress"}
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
                  application.status === "emi_pending"
                    ? "bg-orange-600 hover:bg-orange-700"
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
      {mockApplications.length === 0 && (
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
