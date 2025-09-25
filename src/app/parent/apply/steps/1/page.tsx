import { redirect } from "next/navigation";
import { getServerSession } from "~/server/auth";
import StudentInstitutionForm from "~/components/onboarding/student-institution-form";
import StepLayout from "~/components/onboarding/step-layout";

export default async function StudentInstitutionStep() {
  const session = await getServerSession();
  
  if (!session?.user) {
    redirect("/login/parent");
  }

  const stepTitles = ["Student & Fee Details", "EMI Plan Selection", "Primary Earner", "Welcome", "Personal Details"];

  return (
    <StepLayout
      currentStep={1}
      totalSteps={5}
      stepTitles={stepTitles}
    >
      <StudentInstitutionForm />
    </StepLayout>
  );
}