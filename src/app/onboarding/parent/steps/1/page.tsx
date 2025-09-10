import { redirect } from "next/navigation";
import { getServerSession } from "~/server/auth";
import StudentDetailsForm from "~/components/onboarding/student-details-form";
import OnboardingProgress from "~/components/onboarding-progress";

export default async function StudentDetailsStep() {
  const session = await getServerSession();
  
  if (!session?.user) {
    redirect("/login/parent");
  }

  const stepTitles = ["Student Details", "EMI Plan", "Parent PAN", "Intro", "Personal Details", "Confirmation"];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-4">
        <div className="text-center">
          <h1 className="text-2xl font-semibold mb-1">Let's start with your child's information</h1>
        </div>
      </div>

      {/* Progress Indicator */}
      <OnboardingProgress currentStep={1} totalSteps={6} stepTitles={stepTitles} />

      {/* Form */}
      <div className="p-8">
        <StudentDetailsForm />
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