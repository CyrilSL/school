"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { useToast } from "~/hooks/use-toast";
import { Loader2, CheckCircle } from "lucide-react";

interface EmiPlan {
  id: string;
  duration: number;
  emiAmount: number;
  totalAmount: number;
  processingFee: number;
  interestRate: number;
  features: string[];
  recommended?: boolean;
}

interface EmiPlanData {
  selectedPlanId: string;
  feeAmount: number;
}

export default function EmiPlanForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [formData, setFormData] = useState<EmiPlanData>({
    selectedPlanId: "",
    feeAmount: 0,
  });
  const [loading, setLoading] = useState(true);
  const [emiPlans, setEmiPlans] = useState<EmiPlan[]>([]);

  useEffect(() => {
    // Check if Step 1 is completed
    const studentDetailsData = localStorage.getItem('onboarding-student-details');
    if (!studentDetailsData) {
      toast({
        title: "Please complete Step 1 first",
        description: "You need to complete the student details step before proceeding.",
        variant: "destructive"
      });
      router.push("/parent/onboarding/steps/1");
      return;
    }

    const parsedStudentData = JSON.parse(studentDetailsData);
    const feeAmount = parseFloat(parsedStudentData.feeAmount || "0");
    
    if (feeAmount <= 0) {
      toast({
        title: "Invalid fee amount",
        description: "Please go back and enter a valid fee amount.",
        variant: "destructive"
      });
      router.push("/parent/onboarding/steps/1");
      return;
    }

    // Generate EMI plans based on fee amount
    const plans = generateEmiPlans(feeAmount);
    setEmiPlans(plans);
    setFormData(prev => ({ ...prev, feeAmount }));

    // Load saved data
    const savedData = localStorage.getItem('onboarding-emi-plan');
    if (savedData) {
      const parsed = JSON.parse(savedData);
      setFormData(prev => ({ ...prev, selectedPlanId: parsed.selectedPlanId }));
    }
    
    setLoading(false);
  }, [router]);

  const generateEmiPlans = (feeAmount: number): EmiPlan[] => {
    const processingFeeRate = 0.02; // 2%
    const interestRate = 0; // 0% interest as mentioned

    return [
      {
        id: "3-months",
        duration: 3,
        emiAmount: Math.ceil(feeAmount / 3),
        totalAmount: feeAmount + (feeAmount * processingFeeRate),
        processingFee: feeAmount * processingFeeRate,
        interestRate: 0,
        features: ["No interest", "Quick repayment", "Lower processing fee"],
      },
      {
        id: "6-months",
        duration: 6,
        emiAmount: Math.ceil(feeAmount / 6),
        totalAmount: feeAmount + (feeAmount * processingFeeRate * 1.2),
        processingFee: feeAmount * processingFeeRate * 1.2,
        interestRate: 0,
        features: ["No interest", "Flexible monthly payments", "Most popular"],
        recommended: true,
      },
      {
        id: "9-months",
        duration: 9,
        emiAmount: Math.ceil(feeAmount / 9),
        totalAmount: feeAmount + (feeAmount * processingFeeRate * 1.5),
        processingFee: feeAmount * processingFeeRate * 1.5,
        interestRate: 0,
        features: ["No interest", "Lower monthly burden", "Extended repayment"],
      },
      {
        id: "12-months",
        duration: 12,
        emiAmount: Math.ceil(feeAmount / 12),
        totalAmount: feeAmount + (feeAmount * processingFeeRate * 2),
        processingFee: feeAmount * processingFeeRate * 2,
        interestRate: 0,
        features: ["No interest", "Maximum flexibility", "Minimum monthly payment"],
      },
    ];
  };

  const handlePlanSelect = (planId: string) => {
    setFormData(prev => ({ ...prev, selectedPlanId: planId }));
  };

  const saveProgress = () => {
    localStorage.setItem('onboarding-emi-plan', JSON.stringify(formData));
  };

  const validateForm = () => {
    if (!formData.selectedPlanId) {
      toast({
        title: "Please select an EMI plan",
        description: "You must choose one of the available EMI plans to proceed.",
        variant: "destructive"
      });
      return false;
    }
    return true;
  };

  const handleNext = () => {
    if (!validateForm()) return;
    
    saveProgress();
    router.push("/parent/onboarding/steps/3");
  };

  const handleBack = () => {
    saveProgress();
    router.push("/parent/onboarding/steps/1");
  };

  const handleSaveAndExit = () => {
    saveProgress();
    toast({
      title: "Progress saved",
      description: "Your progress has been saved. You can continue later from your dashboard."
    });
    router.push("/parent/dashboard");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading EMI plans...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="bg-indigo-50 px-8 py-6 border-b border-indigo-200">
          <div className="flex items-center mb-4">
            <div className="bg-indigo-600 text-white rounded-full w-10 h-10 flex items-center justify-center font-semibold mr-4">2</div>
            <h2 className="text-3xl font-bold text-gray-800">EMI Plan Selection</h2>
          </div>
          <p className="text-gray-600">Fee Amount: ₹{formData.feeAmount.toLocaleString('en-IN')} - Choose the payment plan that works best for you</p>
        </div>

        <div className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {emiPlans.map((plan) => (
              <Card 
                key={plan.id} 
                className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
                  formData.selectedPlanId === plan.id 
                    ? 'ring-2 ring-indigo-500 bg-indigo-50' 
                    : 'hover:shadow-md'
                } ${plan.recommended ? 'border-green-500 border-2' : ''}`}
                onClick={() => handlePlanSelect(plan.id)}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{plan.duration} Months</CardTitle>
                    {plan.recommended && (
                      <Badge className="bg-green-500 text-white">Recommended</Badge>
                    )}
                    {formData.selectedPlanId === plan.id && (
                      <CheckCircle className="h-5 w-5 text-indigo-600" />
                    )}
                  </div>
                  <CardDescription>Zero Interest EMI</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-indigo-600">
                        ₹{plan.emiAmount.toLocaleString('en-IN')}
                      </div>
                      <div className="text-sm text-gray-500">per month</div>
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Fee Amount:</span>
                        <span>₹{formData.feeAmount.toLocaleString('en-IN')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Processing Fee:</span>
                        <span>₹{plan.processingFee.toLocaleString('en-IN')}</span>
                      </div>
                      <div className="flex justify-between font-semibold border-t pt-2">
                        <span>Total Amount:</span>
                        <span>₹{plan.totalAmount.toLocaleString('en-IN')}</span>
                      </div>
                    </div>

                    <div className="space-y-1">
                      {plan.features.map((feature, index) => (
                        <div key={index} className="flex items-center text-sm text-gray-600">
                          <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          {feature}
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Info Section */}
          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
            <div className="flex items-start">
              <svg className="w-6 h-6 text-blue-600 mt-1 mr-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-2">Why choose MyFee EMI?</p>
                <ul className="list-disc list-inside space-y-1">
                  <li><strong>Zero Interest:</strong> Pay only the fee amount + minimal processing fee</li>
                  <li><strong>Instant Approval:</strong> Get approved in minutes, not days</li>
                  <li><strong>Direct Payment:</strong> We pay the institution directly</li>
                  <li><strong>Flexible Plans:</strong> Choose from 3, 6, 9, or 12-month plans</li>
                  <li><strong>No Hidden Charges:</strong> Transparent pricing with no surprises</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="bg-gray-50 px-8 py-6 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleSaveAndExit}
              className="px-6"
            >
              Save & Continue Later
            </Button>
          </div>
          
          <div className="flex items-center space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleBack}
            >
              <svg className="mr-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </Button>
            <Button
              type="button"
              onClick={handleNext}
              disabled={!formData.selectedPlanId}
              className="bg-gradient-to-r from-indigo-600 to-purple-700 hover:from-indigo-700 hover:to-purple-800 px-8 text-white"
            >
              Next: Parent PAN
              <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
