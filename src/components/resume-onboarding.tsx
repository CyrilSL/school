"use client";

import { useState, useEffect } from "react";
import { Button } from "~/components/ui/button";

export default function ResumeOnboarding() {
  const [savedData, setSavedData] = useState<{
    hasParentInfo: boolean;
    hasAdditionalInfo: boolean;
    hasStudentInfo: boolean;
  } | null>(null);

  useEffect(() => {
    const parentInfo = localStorage.getItem('onboarding-parent-info');
    const additionalInfo = localStorage.getItem('onboarding-additional-info');
    const studentInfo = localStorage.getItem('onboarding-student-info');

    if (parentInfo || additionalInfo || studentInfo) {
      setSavedData({
        hasParentInfo: !!parentInfo,
        hasAdditionalInfo: !!additionalInfo,
        hasStudentInfo: !!studentInfo,
      });
    }
  }, []);

  if (!savedData) return null;

  const getResumeLink = () => {
    if (savedData.hasStudentInfo) return "/onboarding/parent/steps/3";
    if (savedData.hasAdditionalInfo) return "/onboarding/parent/steps/2";
    if (savedData.hasParentInfo) return "/onboarding/parent/steps/2";
    return "/onboarding/parent/steps/1";
  };

  const getProgressPercentage = () => {
    let completed = 0;
    if (savedData.hasParentInfo) completed += 1;
    if (savedData.hasAdditionalInfo) completed += 1;
    if (savedData.hasStudentInfo) completed += 1;
    return Math.round((completed / 3) * 100);
  };

  const clearSavedData = () => {
    localStorage.removeItem('onboarding-parent-info');
    localStorage.removeItem('onboarding-additional-info');
    localStorage.removeItem('onboarding-student-info');
    setSavedData(null);
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
              <span className={savedData.hasParentInfo ? "font-semibold" : ""}>
                ✓ Parent Info {savedData.hasParentInfo ? "(Saved)" : ""}
              </span>
              <span className={savedData.hasAdditionalInfo ? "font-semibold" : ""}>
                {savedData.hasAdditionalInfo ? "✓" : "○"} Additional Info {savedData.hasAdditionalInfo ? "(Saved)" : ""}
              </span>
              <span className={savedData.hasStudentInfo ? "font-semibold" : ""}>
                {savedData.hasStudentInfo ? "✓" : "○"} Student Info {savedData.hasStudentInfo ? "(Saved)" : ""}
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