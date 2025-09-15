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


  return (
    <div className="max-w-4xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Dashboard</h1>
        <p className="text-gray-600">Welcome back, {session.user?.name}</p>
      </div>

      {/* Application Progress */}
      {onboardingProgress && !onboardingProgress.isCompleted && (
        <div className="mb-6">
          <Card className="max-w-md">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Application Progress</CardTitle>
                <Badge variant="secondary">Pending</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {(() => {
                  const completedSteps = Object.values(onboardingProgress.completedSteps || {}).filter(Boolean).length;
                  const totalSteps = 5;
                  const progressPercentage = (completedSteps / totalSteps) * 100;

                  return (
                    <>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm text-gray-600">
                          <span>{completedSteps} of {totalSteps} steps completed</span>
                          <span>{Math.round(progressPercentage)}%</span>
                        </div>
                        <Progress value={progressPercentage} className="h-2" />
                      </div>

                      {onboardingProgress.nextStep && onboardingProgress.nextStep <= 5 && (
                        <Button asChild className="w-full">
                          <a href={`/parent/onboarding/steps/${onboardingProgress.nextStep}`}>
                            Continue Application
                          </a>
                        </Button>
                      )}
                    </>
                  );
                })()}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Student Information */}
      {students.length === 0 && onboardingProgress?.student && (
        <div className="mb-6">
          <Card className="max-w-md">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Student</CardTitle>
                <Badge variant="outline">Active</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Name</span>
                  <span className="font-medium">{onboardingProgress.student.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Class</span>
                  <span className="font-medium">{onboardingProgress.student.class || "Not specified"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Fee Amount</span>
                  <span className="font-medium">₹{parseFloat(onboardingProgress.student.feeAmount).toLocaleString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

    </div>
  );
}