import { redirect } from "next/navigation";
import { getServerSession } from "~/server/auth";
import PersonalDetailsForm from "~/components/onboarding/personal-details-form";
import StepLayout from "~/components/onboarding/step-layout";

export default async function PersonalDetailsStep() {
  const session = await getServerSession();
  
  if (!session?.user) {
    redirect("/login/parent");
  }

  const stepTitles = ["Student Details", "EMI Plan", "Parent PAN", "Intro", "Personal Details", "Confirmation"];

  return (
    <StepLayout
      currentStep={5}
      totalSteps={6}
      stepTitles={stepTitles}
    >
      <PersonalDetailsForm />
    </StepLayout>
  );
}