"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function ParentOnboarding() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function determineNextStep() {
      try {
        console.log("ParentOnboarding: Fetching onboarding progress...");
        const response = await fetch("/api/parent/onboarding/partial");

        console.log("ParentOnboarding: API Response status:", response.status);

        if (!response.ok) {
          console.log("ParentOnboarding: API failed, defaulting to step 1");
          // If API fails, default to step 1
          router.push("/onboarding/parent/steps/1");
          return;
        }

        const data = await response.json();
        console.log("ParentOnboarding: API Response data:", data);

        if (data.isCompleted) {
          console.log("ParentOnboarding: Onboarding complete, going to dashboard");
          // If onboarding is complete, go to dashboard
          router.push("/dashboard/parent");
        } else {
          console.log(`ParentOnboarding: Redirecting to step ${data.nextStep}`);
          // Redirect to the next incomplete step
          router.push(`/onboarding/parent/steps/${data.nextStep}`);
        }
      } catch (error) {
        console.error("ParentOnboarding: Error determining next step:", error);
        // Default to step 1 on error
        router.push("/onboarding/parent/steps/1");
      } finally {
        setLoading(false);
      }
    }

    determineNextStep();
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-blue-600" />
        <h2 className="text-xl font-semibold text-gray-800 mb-2">Loading your progress...</h2>
        <p className="text-gray-600">We're taking you to where you left off</p>
      </div>
    </div>
  );
}