import { redirect } from "next/navigation";
import { getServerSession } from "~/server/auth";
import PrimaryEarnerForm from "~/components/onboarding/primary-earner-form";
import StepLayout from "~/components/onboarding/step-layout";

export default async function PrimaryEarnerStep() {
  const session = await getServerSession();
  
  if (!session?.user) {
    redirect("/login/parent");
  }

  const stepTitles = ["Student & Fee Details", "EMI Plan Selection", "Primary Earner", "Welcome", "Personal Details"];

  return (
    <StepLayout
      currentStep={3}
      totalSteps={5}
      stepTitles={stepTitles}
    >
      <PrimaryEarnerForm />
    </StepLayout>
  );
}