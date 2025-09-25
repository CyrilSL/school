import { redirect } from "next/navigation";
import { getServerSession } from "~/server/auth";
import EmiPlanSelectionForm from "~/components/onboarding/emi-plan-selection-form";
import StepLayout from "~/components/onboarding/step-layout";

export default async function EmiPlanSelectionStep() {
  const session = await getServerSession();
  
  if (!session?.user) {
    redirect("/login/parent");
  }

  const stepTitles = ["Student & Fee Details", "EMI Plan Selection", "Primary Earner", "Welcome", "Personal Details"];

  return (
    <StepLayout
      currentStep={2}
      totalSteps={5}
      stepTitles={stepTitles}
    >
      <EmiPlanSelectionForm />
    </StepLayout>
  );
}