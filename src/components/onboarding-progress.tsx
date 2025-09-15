"use client";

import { Progress } from "~/components/ui/progress";

interface OnboardingProgressProps {
  currentStep: number;
  totalSteps: number;
  stepTitles: string[];
}

export default function OnboardingProgress({ currentStep, totalSteps, stepTitles }: OnboardingProgressProps) {
  const progressValue = (currentStep / totalSteps) * 100;

  return (
    <div className="bg-white border-b border-gray-200 px-8 py-6">
      <div className="max-w-4xl mx-auto">
        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Step {currentStep} of {totalSteps}</span>
            <span>{Math.round(progressValue)}% Complete</span>
          </div>
          <Progress value={progressValue} className="h-2" />
        </div>

        {/* Step Indicators */}
        <div className="flex justify-between">
          {stepTitles.map((title, index) => {
            const stepNumber = index + 1;
            const isActive = stepNumber === currentStep;
            const isCompleted = stepNumber < currentStep;
            const isAccessible = stepNumber <= currentStep;

            return (
              <div key={index} className="flex flex-col items-center flex-1">
                <div className={`
                  w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold mb-2 transition-colors
                  ${isCompleted 
                    ? 'bg-green-500 text-white' 
                    : isActive 
                    ? 'bg-blue-600 text-white' 
                    : isAccessible
                    ? 'bg-gray-300 text-gray-600'
                    : 'bg-gray-200 text-gray-400'
                  }
                `}>
                  {isCompleted ? (
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    stepNumber
                  )}
                </div>
                <div className={`
                  text-xs text-center max-w-24 leading-tight
                  ${isActive ? 'text-blue-600 font-medium' : isCompleted ? 'text-green-600' : 'text-gray-500'}
                `}>
                  {title}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}