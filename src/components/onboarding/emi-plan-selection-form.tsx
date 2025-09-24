"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { useToast } from "~/hooks/use-toast";
import { Loader2, CheckCircle, ArrowLeft } from "lucide-react";

interface EmiPlan {
  id: string;
  label: string;
  duration: number;
  monthlyAmount: number;
  interestPerMonth: number;
  payableToday: number;
  recommended?: boolean;
  popular?: boolean;
}

export default function EmiPlanSelectionForm() {
  console.log("🚀 EMI PLAN SELECTION FORM COMPONENT MOUNTED!");
  const router = useRouter();
  const { toast } = useToast();
  const [selectedPlanId, setSelectedPlanId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [emiPlans, setEmiPlans] = useState<EmiPlan[]>([]);
  const [feeAmount, setFeeAmount] = useState<number>(0);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    // Load data from previous step
    const studentData = localStorage.getItem('onboarding-student-institution');
    
    if (!studentData) {
      // If no data, just use defaults
      setLoading(false);
      return;
    }

    let parsedData;
    try {
      parsedData = JSON.parse(studentData);
    } catch (e) {
      // If data is corrupted, just use defaults
      setLoading(false);
      return;
    }
    
    const amount = parseFloat(parsedData.annualFeeAmount || "0");
    
    if (amount <= 0) {
      // If no valid amount, just use defaults
      setLoading(false);
      return;
    }

    setFeeAmount(amount);
    
    // Generate EMI plans based on fee amount (similar to competitor structure)
    console.log("Generating EMI plans for amount:", amount);
    const plans = generateEmiPlans(amount);
    console.log("Generated plans:", plans);
    setEmiPlans(plans);

    // Load saved selection
    const savedData = localStorage.getItem('onboarding-emi-plan');
    if (savedData) {
      const parsed = JSON.parse(savedData);
      console.log("Loading saved EMI plan selection:", parsed);
      setSelectedPlanId(parsed.selectedPlanId);
    }
    
    console.log("Step 2 setup complete, setting loading to false");
    setLoading(false);
  }, [router]);

  const generateEmiPlans = (amount: number): EmiPlan[] => {
    // Calculate plans similar to competitor
    const baseProcessingFee = amount * 0.02;

    return [
      {
        id: "plan-a",
        label: "A",
        duration: 9,
        monthlyAmount: Math.ceil(amount / 9),
        interestPerMonth: 793,
        payableToday: Math.ceil(amount / 9),
        recommended: true,
      },
      {
        id: "plan-b", 
        label: "B",
        duration: 6,
        monthlyAmount: Math.ceil(amount / 6),
        interestPerMonth: 800,
        payableToday: Math.ceil(amount / 6),
        popular: true,
      },
      {
        id: "plan-c",
        label: "C", 
        duration: 12,
        monthlyAmount: Math.ceil(amount / 12),
        interestPerMonth: 744,
        payableToday: Math.ceil(amount / 12),
      },
      {
        id: "plan-d",
        label: "D",
        duration: 18,
        monthlyAmount: Math.ceil(amount / 18),
        interestPerMonth: 743,
        payableToday: Math.ceil(amount / 18),
      },
      {
        id: "plan-e",
        label: "E",
        duration: 24,
        monthlyAmount: Math.ceil(amount / 24),
        interestPerMonth: 744,
        payableToday: Math.ceil(amount / 24),
      },
    ];
  };

  const handlePlanSelect = (planId: string) => {
    setSelectedPlanId(planId);
  };

  const saveProgress = () => {
    const data = {
      selectedPlanId,
      feeAmount,
    };
    localStorage.setItem('onboarding-emi-plan', JSON.stringify(data));
  };

  const saveToDatabase = async () => {
    try {
      const response = await fetch("/api/parent/apply/partial", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          step: 2,
          data: {
            selectedPlanId,
            feeAmount,
          },
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to save data");
      }

      return true;
    } catch (error) {
      console.error("Error saving to database:", error);
      toast({
        title: "Error saving data",
        description: error instanceof Error ? error.message : "Failed to save progress to database",
        variant: "destructive"
      });
      return false;
    }
  };

  const handleProceed = async () => {
    if (!selectedPlanId) {
      toast({
        title: "Please select an EMI plan",
        description: "You must choose one of the available EMI plans to proceed.",
        variant: "destructive"
      });
      return;
    }

    setIsSaving(true);

    // Save to localStorage (keep existing functionality)
    saveProgress();

    // Save to database
    const saved = await saveToDatabase();

    setIsSaving(false);

    if (saved) {
      router.push("/parent/apply/steps/3");
    }
  };

  const handleBack = () => {
    saveProgress();
    router.push("/parent/apply/steps/1");
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
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="bg-indigo-50 px-8 py-6 border-b border-indigo-200">
        <div className="flex items-center mb-4">
          <div className="bg-indigo-600 text-white rounded-full w-10 h-10 flex items-center justify-center font-semibold mr-4">2</div>
          <h2 className="text-3xl font-bold text-gray-800">Select EMI Plan</h2>
        </div>
        <p className="text-gray-600">
          Number of available EMI Plans: <span className="font-semibold">{emiPlans.length}</span> | 
          Fee Amount: <span className="font-semibold">₹{feeAmount.toLocaleString('en-IN')}</span>
        </p>
      </div>

      <div className="p-8">
        <div className="space-y-6">

        {/* EMI Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {emiPlans.map((plan) => (
            <Card 
              key={plan.id}
              className={`cursor-pointer transition-all duration-200 hover:shadow-md border-2 ${
                selectedPlanId === plan.id 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => handlePlanSelect(plan.id)}
            >
              <CardContent className="p-6">
                <div className="space-y-4">
                  {/* Plan Header */}
                  <div className="flex items-center justify-between">
                    <div className="text-2xl font-bold text-blue-600">
                      {plan.label}
                    </div>
                    <div className="flex flex-col space-y-1">
                      {plan.recommended && (
                        <Badge className="bg-green-500 text-white text-xs">Recommended</Badge>
                      )}
                      {plan.popular && (
                        <Badge className="bg-orange-500 text-white text-xs">Most Popular</Badge>
                      )}
                      {selectedPlanId === plan.id && (
                        <CheckCircle className="h-5 w-5 text-blue-600 ml-auto" />
                      )}
                    </div>
                  </div>

                  {/* Monthly Payment */}
                  <div className="text-center">
                    <div className="text-lg font-bold text-gray-800">
                      Rs. {plan.monthlyAmount.toLocaleString('en-IN')}/month × {plan.duration} months
                    </div>
                  </div>

                  {/* Details */}
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Interest per month</span>
                      <span className="font-medium">{plan.interestPerMonth}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Payable Today</span>
                      <span className="font-medium">{plan.payableToday.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Info Section */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
          <p className="text-sm text-blue-800">
            All plans include <strong>zero processing fees</strong> and <strong>flexible payment options</strong>
          </p>
        </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="bg-gray-50 px-8 py-6 flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/parent/dashboard")}
            className="px-6"
          >
            Save & Continue Later
          </Button>
        </div>
        
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            onClick={handleBack}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back</span>
          </Button>
          
        <Button
          onClick={handleProceed}
          disabled={!selectedPlanId || isSaving}
          className="bg-gradient-to-r from-indigo-600 to-purple-700 hover:from-indigo-700 hover:to-purple-800 px-8 text-white"
        >
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                Next: Primary Earner
                <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
