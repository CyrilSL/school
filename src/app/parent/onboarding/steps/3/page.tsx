import { redirect } from "next/navigation";
import { getServerSession } from "~/server/auth";
import PrimaryEarnerForm from "~/components/onboarding/primary-earner-form";
import OnboardingProgress from "~/components/onboarding-progress";
import OnboardingHeader from "~/components/onboarding/onboarding-header";

export default async function PrimaryEarnerStep() {
  const session = await getServerSession();
  
  if (!session?.user) {
    redirect("/login/parent");
  }

  const stepTitles = ["Student & Fee Details", "EMI Plan Selection", "Primary Earner", "Welcome", "Personal Details"];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <OnboardingHeader
        title="Primary Earner Details"
        subtitle="We need details of the primary earning member"
      />

      {/* Progress Indicator */}
      <OnboardingProgress currentStep={3} totalSteps={5} stepTitles={stepTitles} />

      {/* Form */}
      <div className="p-8">
        <div className="max-w-2xl mx-auto">
          <PrimaryEarnerForm />
        </div>
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