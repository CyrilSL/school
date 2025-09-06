"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function OnboardingChecker() {
  const router = useRouter();

  useEffect(() => {
    const checkOnboardingStatus = async () => {
      try {
        const response = await fetch("/api/parent/onboarding");
        if (response.ok) {
          const data = await response.json();
          if (!data.isOnboardingCompleted) {
            router.push("/onboarding/parent");
          }
        }
      } catch (error) {
        console.error("Error checking onboarding:", error);
        // On error, redirect to onboarding to be safe
        router.push("/onboarding/parent");
      }
    };

    checkOnboardingStatus();
  }, [router]);

  return null; // This component doesn't render anything
}