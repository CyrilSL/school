import { redirect } from "next/navigation";
import { getServerSession } from "~/server/auth";
import ParentInfoForm from "~/components/onboarding/parent-info-form";
import OnboardingProgress from "~/components/onboarding-progress";

export default async function ParentInfoStep() {
  const session = await getServerSession();
  
  if (!session?.user) {
    redirect("/login/parent");
  }

  const stepTitles = ["Parent Info", "Additional Info", "Student Info"];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-2">Welcome to MyFee</h1>
          <p className="text-blue-100 text-lg">Let's set up your parent profile</p>
        </div>
      </div>

      {/* Progress Indicator */}
      <OnboardingProgress currentStep={1} totalSteps={3} stepTitles={stepTitles} />

      {/* Form */}
      <div className="p-8">
        <ParentInfoForm />
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