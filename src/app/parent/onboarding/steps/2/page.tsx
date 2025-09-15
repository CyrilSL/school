import { redirect } from "next/navigation";
import { getServerSession } from "~/server/auth";
import EmiPlanSelectionForm from "~/components/onboarding/emi-plan-selection-form";
import OnboardingProgress from "~/components/onboarding-progress";
import OnboardingHeader from "~/components/onboarding/onboarding-header";

export default async function EmiPlanSelectionStep() {
  const session = await getServerSession();
  
  if (!session?.user) {
    redirect("/login/parent");
  }

  const stepTitles = ["Student & Fee Details", "EMI Plan Selection", "Primary Earner", "Welcome", "Personal Details"];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <OnboardingHeader
        title="EMI Plan Selection"
        subtitle="Choose the best payment plan for you"
      />

      {/* Progress Indicator */}
      <OnboardingProgress currentStep={2} totalSteps={5} stepTitles={stepTitles} />

      {/* Form */}
      <div className="p-8">
        <div className="max-w-6xl mx-auto">
          <EmiPlanSelectionForm />
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