import { redirect } from "next/navigation";
import { getServerSession } from "~/server/auth";
import StudentInfoForm from "~/components/onboarding/student-info-form";
import OnboardingProgress from "~/components/onboarding-progress";

export default async function StudentInfoStep() {
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
          <h1 className="text-4xl font-bold mb-2">Student Information</h1>
          <p className="text-blue-100 text-lg">Tell us about your child's education</p>
        </div>
      </div>

      {/* Progress Indicator */}
      <OnboardingProgress currentStep={3} totalSteps={3} stepTitles={stepTitles} />

      {/* Form */}
      <div className="p-8">
        <StudentInfoForm />
      </div>

      {/* Footer */}
      <div className="bg-gray-50 px-8 py-6 border-t">
        <div className="text-center text-sm text-gray-600">
          <p>Need help? Contact our support team at <span className="text-blue-600 font-medium">support@myfee.com</span></p>
          <p className="mt-1">By completing onboarding, you agree to our Terms of Service and Privacy Policy</p>
        </div>
      </div>
    </div>
  );
}