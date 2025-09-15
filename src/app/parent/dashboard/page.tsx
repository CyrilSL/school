import { redirect } from "next/navigation";
import { getServerSession } from "~/server/auth";
import { headers } from "next/headers";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import OnboardingChecker from "~/components/onboarding-checker";
import ResumeOnboarding from "~/components/resume-onboarding";

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
    const headersList = headers();
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
    <div className="container mx-auto p-6">
      <OnboardingChecker />
      <ResumeOnboarding />
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Parent Dashboard</h1>
        <p className="text-gray-600">Welcome, {session.user?.name}</p>
        <div className="mt-2 p-2 bg-green-100 rounded">
          <p className="text-sm text-green-800">
            Role: Parent | Email: {session.user?.email}
          </p>
        </div>
      </div>

      {/* Onboarding Forms Status Section */}
      {onboardingProgress && !onboardingProgress.isCompleted && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Your Application Status</h2>
          <div className="bg-white rounded-lg shadow border">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium">Onboarding Progress</h3>
                <Badge variant="secondary">In Progress</Badge>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between py-2 border-b">
                  <span className="text-sm font-medium">Student & Fee Details</span>
                  <Badge variant={onboardingProgress.completedSteps?.step1 ? "default" : "outline"}>
                    {onboardingProgress.completedSteps?.step1 ? "Completed" : "Pending"}
                  </Badge>
                </div>

                <div className="flex items-center justify-between py-2 border-b">
                  <span className="text-sm font-medium">EMI Plan Selection</span>
                  <Badge variant={onboardingProgress.completedSteps?.step2 ? "default" : "outline"}>
                    {onboardingProgress.completedSteps?.step2 ? "Completed" : "Pending"}
                  </Badge>
                </div>

                <div className="flex items-center justify-between py-2 border-b">
                  <span className="text-sm font-medium">Primary Earner Details</span>
                  <Badge variant={onboardingProgress.completedSteps?.step3 ? "default" : "outline"}>
                    {onboardingProgress.completedSteps?.step3 ? "Completed" : "Pending"}
                  </Badge>
                </div>

                <div className="flex items-center justify-between py-2 border-b">
                  <span className="text-sm font-medium">Welcome Information</span>
                  <Badge variant={onboardingProgress.completedSteps?.step4 ? "default" : "outline"}>
                    {onboardingProgress.completedSteps?.step4 ? "Completed" : "Pending"}
                  </Badge>
                </div>

                <div className="flex items-center justify-between py-2">
                  <span className="text-sm font-medium">Personal Details</span>
                  <Badge variant={onboardingProgress.completedSteps?.step5 ? "default" : "outline"}>
                    {onboardingProgress.completedSteps?.step5 ? "Completed" : "Pending"}
                  </Badge>
                </div>
              </div>

              {onboardingProgress.nextStep && onboardingProgress.nextStep <= 5 && (
                <div className="mt-4 pt-4 border-t">
                  <p className="text-sm text-gray-600 mb-3">
                    Next step: Continue with step {onboardingProgress.nextStep}
                  </p>
                  <a
                    href={`/parent/onboarding/steps/${onboardingProgress.nextStep}`}
                    className="inline-flex items-center justify-center rounded-md bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 text-sm font-medium transition-colors"
                  >
                    Continue Application
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Students Section */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Your Students</h2>
        {students.length === 0 && onboardingProgress?.student ? (
          <div className="bg-white rounded-lg shadow border p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium">Student Information</h3>
              <Badge variant="secondary">From Application</Badge>
            </div>
            <div className="space-y-2">
              <p><span className="font-medium">Name:</span> {onboardingProgress.student.name}</p>
              <p><span className="font-medium">Class:</span> {onboardingProgress.student.class || "Not specified"}</p>
              {onboardingProgress.student.rollNumber && (
                <p><span className="font-medium">Roll Number:</span> {onboardingProgress.student.rollNumber}</p>
              )}
              <p><span className="font-medium">Fee Amount:</span> ₹{parseFloat(onboardingProgress.student.feeAmount).toLocaleString()}</p>
              <p><span className="font-medium">Fee Type:</span> {onboardingProgress.student.feeType}</p>
            </div>
          </div>
        ) : students.length === 0 ? (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <div className="text-center">
              <div className="text-blue-600 mb-4">
                <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Students Added Yet</h3>
              <p className="text-blue-700 mb-4">It looks like you haven't added any student information yet.</p>
              <a
                href="/parent/onboarding"
                className="inline-flex items-center justify-center rounded-md bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 text-sm font-medium transition-colors"
              >
                Add Student Information
              </a>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {students.map((student) => (
              <div key={student.id} className="bg-white p-4 rounded-lg shadow border">
                <h3 className="font-medium text-lg">{student.name}</h3>
                <p className="text-sm text-gray-600">{student.rollNumber}</p>
                <p className="text-sm text-gray-600">{student.class} {student.section}</p>
                <p className="text-sm text-gray-600">{student.institution}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Available Fees Section */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Available Fees for EMI (Platform Financing)</h2>
        <div className="mb-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>How it works:</strong> Apply for EMI through our platform. We pay the institution directly, 
            and you pay us in easy monthly installments with zero interest.
          </p>
        </div>
        {availableFees.length === 0 ? (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
            <p className="text-gray-600">No fees available for EMI at the moment.</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fee Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Due Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      EMI Options
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {availableFees.map((fee) => (
                    <tr key={fee.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <p className="font-medium text-gray-900">{fee.name}</p>
                          <p className="text-sm text-gray-500">Academic Year: {fee.academicYear}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ₹{fee.amount.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {fee.dueDate}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="space-x-2">
                          {emiPlans.map((plan) => (
                            <button
                              key={plan.id}
                              className="mb-1 inline-flex items-center rounded-md border border-gray-300 bg-white px-3 py-1 text-sm font-medium text-gray-700 hover:bg-gray-50"
                              disabled
                            >
                              {plan.name} (₹{(fee.amount / plan.installments).toLocaleString()}/month)
                            </button>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Applications Section */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Your EMI Applications (Platform Managed)</h2>
        <div className="mb-4 p-3 bg-green-50 rounded-lg">
          <p className="text-sm text-green-800">
            ✓ <strong>Platform Protection:</strong> Once approved, we handle payment to your institution immediately. 
            You can then pay us through convenient EMI installments.
          </p>
        </div>
        {applications.length === 0 ? (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
            <p className="text-gray-600">No EMI applications yet.</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fee Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      EMI Plan
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Monthly Payment
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Applied Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {applications.map((application) => (
                    <tr key={application.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <p className="font-medium text-gray-900">{application.feeStructure.name}</p>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ₹{application.feeStructure.amount.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {application.emiPlan.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ₹{application.emiPlan.monthlyAmount.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge 
                          variant={
                            application.status === "approved" 
                              ? "default"
                              : application.status === "rejected"
                              ? "destructive"
                              : "secondary"
                          }
                        >
                          {application.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {application.appliedAt}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {application.status === "approved" && (
                          <a
                            href={`/parent/dashboard/installments?applicationId=${application.id}`}
                            className="inline-flex items-center rounded-md border border-gray-300 bg-white px-3 py-1 text-sm font-medium text-gray-700 hover:bg-gray-50"
                          >
                            View Installments
                          </a>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}