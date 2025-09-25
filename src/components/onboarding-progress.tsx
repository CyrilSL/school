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
    <div className="p-6 h-full flex flex-col">
      {/* Progress Header */}
      <div className="mb-8">
        <div className="text-sm text-gray-600 mb-2">
          <span>Step {currentStep} of {totalSteps}</span>
        </div>
        <div className="text-sm text-gray-600 mb-4">
          <span>{Math.round(progressValue)}% Complete</span>
        </div>
        <Progress value={progressValue} className="h-2" />
      </div>

      {/* Vertical Step Indicators */}
      <div className="flex-1 space-y-6">
        {stepTitles.map((title, index) => {
          const stepNumber = index + 1;
          const isActive = stepNumber === currentStep;
          const isCompleted = stepNumber < currentStep;
          const isAccessible = stepNumber <= currentStep;

          return (
            <div key={index} className="relative flex items-start space-x-4">
              <div className="flex flex-col items-center">
                <div className={`
                  w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-colors flex-shrink-0
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
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    stepNumber
                  )}
                </div>
                {/* Connecting line */}
                {index < stepTitles.length - 1 && (
                  <div className="w-0.5 h-6 bg-gray-200 mt-2"></div>
                )}
              </div>
              <div className="flex-1 pt-2">
                <div className={`
                  text-sm leading-tight
                  ${isActive ? 'text-blue-600 font-semibold' : isCompleted ? 'text-green-600 font-medium' : 'text-gray-500'}
                `}>
                  {title}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Dashboard Button at Bottom */}
      <div className="mt-8 pt-6 border-t border-gray-200">
        <a
          href="/parent/dashboard"
          className="w-full inline-flex items-center justify-center px-4 py-3 border border-blue-400 rounded-md text-sm font-medium text-blue-600 hover:bg-blue-50 transition-colors"
        >
          Go to Dashboard
        </a>
      </div>
    </div>
  );
}