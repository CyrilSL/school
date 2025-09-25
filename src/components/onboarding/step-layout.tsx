import OnboardingProgress from "~/components/onboarding-progress";

interface StepLayoutProps {
  currentStep: number;
  totalSteps: number;
  stepTitles: string[];
  children: React.ReactNode;
}

export default function StepLayout({
  currentStep,
  totalSteps,
  stepTitles,
  children,
}: StepLayoutProps) {
  return (
    <div className="min-h-screen flex">
      {/* Left Sidebar - Progress Indicator (Sticky) */}
      <div className="w-80 border-r border-gray-200 sticky top-0 h-screen overflow-y-auto">
        <OnboardingProgress
          currentStep={currentStep}
          totalSteps={totalSteps}
          stepTitles={stepTitles}
        />
      </div>

      {/* Right Content - Form (Scrollable) */}
      <div className="flex-1 flex flex-col min-h-screen">
        <div className="flex-1 overflow-y-auto p-8">
          <div className="max-w-4xl mx-auto">{children}</div>
        </div>

        {/* Footer - Only below form content */}
        <div className="bg-gray-50 px-8 py-6 mt-auto">
          <div className="text-center text-sm text-gray-600">
            <p>Need help? Contact our support team at <span className="text-blue-600 font-medium">support@myfee.com</span></p>
          </div>
        </div>
      </div>
    </div>
  );
}