import { redirect } from "next/navigation";
import { getServerSession } from "~/server/auth";
import TermsConfirmationForm from "~/components/onboarding/terms-confirmation-form";
import StepLayout from "~/components/onboarding/step-layout";

export default async function TermsConfirmationStep() {
  const session = await getServerSession();
  
  if (!session?.user) {
    redirect("/login/parent");
  }

  const stepTitles = ["Student Details", "EMI Plan", "Parent PAN", "Intro", "Personal Details", "Confirmation"];

  return (
    <StepLayout
      currentStep={6}
      totalSteps={6}
      stepTitles={stepTitles}
    >
      <TermsConfirmationForm />
    </StepLayout>
  );
}