import { redirect } from "next/navigation";
import { getServerSession } from "~/server/auth";
import OnboardingIntroForm from "~/components/onboarding/onboarding-intro-form";
import StepLayout from "~/components/onboarding/step-layout";

export default async function OnboardingIntroStep() {
  const session = await getServerSession();
  
  if (!session?.user) {
    redirect("/login/parent");
  }

  const stepTitles = ["Student Details", "EMI Plan", "Parent PAN", "Intro", "Personal Details", "Confirmation"];

  return (
    <StepLayout
      currentStep={4}
      totalSteps={6}
      stepTitles={stepTitles}
    >
      <OnboardingIntroForm />
    </StepLayout>
  );
}