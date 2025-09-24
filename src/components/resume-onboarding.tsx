"use client";

import { useState, useEffect } from "react";
import { Button } from "~/components/ui/button";
import { Loader2 } from "lucide-react";

interface OnboardingProgress {
  isCompleted: boolean;
  nextStep: number;
  completedSteps: {
    step1: boolean;
    step2: boolean;
    step3: boolean;
    step4: boolean;
    step5: boolean;
  };
  profile?: any;
  student?: any;
}

export default function ResumeOnboarding() {
  const [progressData, setProgressData] = useState<OnboardingProgress | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOnboardingProgress() {
      try {
        const response = await fetch("/api/parent/apply/partial");

        if (!response.ok) {
          setLoading(false);
          return;
        }

        const data = await response.json();

        // Only show resume component if there's partial progress (not complete, but some steps done)
        if (!data.isCompleted && (data.completedSteps.step1 || data.completedSteps.step2 || data.completedSteps.step3 || data.completedSteps.step5)) {
          setProgressData(data);
        }
      } catch (error) {
        console.error("Error fetching onboarding progress:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchOnboardingProgress();
  }, []);

  if (loading) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
        <div className="flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-blue-600 mr-2" />
          <span className="text-blue-800">Checking onboarding progress...</span>
        </div>
      </div>
    );
  }

  if (!progressData) return null;

  const getResumeLink = () => {
    return `/parent/apply/steps/${progressData.nextStep}`;
  };

  const getProgressPercentage = () => {
    const { completedSteps } = progressData;
    let completed = 0;
    const total = 5; // Total steps (excluding step 4 which is just intro)

    if (completedSteps.step1) completed += 1;
    if (completedSteps.step2) completed += 1;
    if (completedSteps.step3) completed += 1;
    // step4 is intro, not counted
    if (completedSteps.step5) completed += 1;

    return Math.round((completed / (total - 1)) * 100); // -1 because step 4 doesn't count
  };

  const getCompletedStepsText = () => {
    const { completedSteps } = progressData;
    const steps = [];

    if (completedSteps.step1) steps.push("Student Details");
    if (completedSteps.step2) steps.push("EMI Plan");
    if (completedSteps.step3) steps.push("Primary Earner");
    if (completedSteps.step5) steps.push("Personal Details");

    return steps.length > 0 ? steps.join(", ") : "Getting started";
  };

  const clearSavedData = () => {
    // Clear both localStorage and show confirmation
    localStorage.clear();
    setProgressData(null);
  };

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
      <div className="flex items-start">
        <div className="text-blue-600 mr-3 mt-1">
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">
            Continue Your Onboarding
          </h3>
          <p className="text-blue-800 mb-4">
            You have saved onboarding progress ({getProgressPercentage()}% complete).
            Would you like to continue where you left off?
          </p>
          <p className="text-sm text-blue-700 mb-4">
            Completed: {getCompletedStepsText()}
          </p>

          {/* Progress Indicator */}
          <div className="mb-4">
            <div className="flex justify-between text-sm text-blue-700 mb-2">
              <span>Progress</span>
              <span>{getProgressPercentage()}% Complete</span>
            </div>
            <div className="w-full bg-blue-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${getProgressPercentage()}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-blue-600 mt-2">
              <span className={progressData.completedSteps.step1 ? "font-semibold" : ""}>
                {progressData.completedSteps.step1 ? "✓" : "○"} Student Details
              </span>
              <span className={progressData.completedSteps.step2 ? "font-semibold" : ""}>
                {progressData.completedSteps.step2 ? "✓" : "○"} EMI Plan
              </span>
              <span className={progressData.completedSteps.step3 ? "font-semibold" : ""}>
                {progressData.completedSteps.step3 ? "✓" : "○"} Primary Earner
              </span>
              <span className={progressData.completedSteps.step5 ? "font-semibold" : ""}>
                {progressData.completedSteps.step5 ? "✓" : "○"} Personal Details
              </span>
            </div>
          </div>

          <div className="flex space-x-3">
            <a href={getResumeLink()}>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                Continue Onboarding
              </Button>
            </a>
            <Button
              variant="outline"
              onClick={clearSavedData}
              className="border-blue-300 text-blue-700 hover:bg-blue-100"
            >
              Start Over
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}