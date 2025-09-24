import { redirect } from "next/navigation";
import { getServerSession } from "~/server/auth";
import PersonalDetailsForm from "~/components/onboarding/personal-details-form";
import OnboardingProgress from "~/components/onboarding-progress";

export default async function PersonalDetailsStep() {
  const session = await getServerSession();
  
  if (!session?.user) {
    redirect("/login/parent");
  }

  const stepTitles = ["Student Details", "EMI Plan", "Parent PAN", "Intro", "Personal Details", "Confirmation"];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-teal-700 text-white p-4">
        <div className="flex justify-between items-center">
          <div className="flex-1">
            <div className="text-center">
              <h1 className="text-2xl font-semibold mb-1">Complete your personal information for loan approval</h1>
            </div>
          </div>
          <div>
            <a
              href="/parent/dashboard"
              className="inline-flex items-center px-4 py-2 border border-green-400 rounded-md text-sm font-medium text-white hover:bg-green-500 transition-colors"
            >
              Dashboard
            </a>
          </div>
        </div>
      </div>

      {/* Progress Indicator */}
      <OnboardingProgress currentStep={5} totalSteps={6} stepTitles={stepTitles} />

      {/* Form */}
      <div className="p-8">
        <PersonalDetailsForm />
      </div>

      {/* Footer */}
      <div className="bg-gray-50 px-8 py-6 border-t">
        <div className="text-center text-sm text-gray-600">
          <p>Need help? Contact our support team at <span className="text-blue-600 font-medium">support@myfee.com</span></p>
        </div>
      </div>
    </div>
  );
}