import { redirect } from "next/navigation";
import { getServerSession } from "~/server/auth";
import OnboardingForm from "~/components/onboarding-form";

export default async function ParentOnboarding() {
  // Server-side authentication check (same as homepage)
  const session = await getServerSession();
  
  if (!session?.user) {
    redirect("/login/parent");
  }

  // Redirect to the multi-step onboarding flow
  redirect("/onboarding/parent/steps/1");
}