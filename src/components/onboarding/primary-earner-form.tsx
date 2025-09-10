"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { useToast } from "~/hooks/use-toast";
import { Loader2, Info, User, ArrowLeft } from "lucide-react";

interface PrimaryEarnerData {
  firstName: string;
  lastName: string;
}

export default function PrimaryEarnerForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [formData, setFormData] = useState<PrimaryEarnerData>({
    firstName: "",
    lastName: "",
  });
  const [loading, setLoading] = useState(true);
  const [isFormValid, setIsFormValid] = useState(false);

  useEffect(() => {
    // Check if previous steps are completed
    const studentData = localStorage.getItem('onboarding-student-institution');
    const emiData = localStorage.getItem('onboarding-emi-plan');
    
    if (!studentData || !emiData) {
      toast({
        title: "Please complete previous steps",
        description: "You need to complete the previous steps before proceeding.",
        variant: "destructive"
      });
      router.push("/onboarding/parent/steps/1");
      return;
    }

    // Load saved data
    const savedData = localStorage.getItem('onboarding-primary-earner');
    if (savedData) {
      setFormData(JSON.parse(savedData));
    }
    
    setLoading(false);
  }, [router]);

  useEffect(() => {
    setIsFormValid(validateForm());
  }, [formData]);

  const handleInputChange = (field: keyof PrimaryEarnerData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const saveProgress = () => {
    localStorage.setItem('onboarding-primary-earner', JSON.stringify(formData));
  };

  const validateForm = () => {
    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      return false;
    }
    return true;
  };

  const handleProceed = () => {
    if (!validateForm()) return;
    
    saveProgress();
    router.push("/onboarding/parent/steps/4");
  };

  const handleBack = () => {
    saveProgress();
    router.push("/onboarding/parent/steps/2");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="bg-purple-50 px-8 py-6 border-b border-purple-200">
        <div className="flex items-center mb-4">
          <div className="bg-purple-600 text-white rounded-full w-10 h-10 flex items-center justify-center font-semibold mr-4">3</div>
          <h2 className="text-3xl font-bold text-gray-800">What is your Name?</h2>
        </div>
        <p className="text-gray-600">Primary earning member information for EMI registration</p>
      </div>

      <div className="p-8">
        <div className="space-y-8">
        {/* Info Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <Info className="h-5 w-5 text-blue-600 mt-1 flex-shrink-0" />
            <div className="text-sm text-blue-800">
              <p className="font-medium">Important Information</p>
              <p className="mt-1">
                To register for EMI plan, we require you to enter details of the 
                <strong> primary earning member</strong> of the family only (usually a parent)
              </p>
            </div>
          </div>
        </div>

        {/* Form Fields */}
        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="firstName" className="text-base font-medium">
              First Name (as per PAN Card)
            </Label>
            <Input
              id="firstName"
              value={formData.firstName}
              onChange={(e) => handleInputChange("firstName", e.target.value)}
              placeholder="First Name (as per PAN Card)"
              className="h-12 text-lg"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="lastName" className="text-base font-medium">
              Last Name (as per PAN Card)
            </Label>
            <Input
              id="lastName"
              value={formData.lastName}
              onChange={(e) => handleInputChange("lastName", e.target.value)}
              placeholder="Last Name (as per PAN Card)"
              className="h-12 text-lg"
            />
          </div>
        </div>

        {/* Credit Score Disclaimer */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="text-sm text-green-800">
            <p>
              <strong>Privacy Notice:</strong> By proceeding, you allow affiliated banking partners 
              to fetch details from our partner bureau. Your credit score will 
              <strong> not be impacted</strong> by this.
            </p>
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
            onClick={() => router.push("/dashboard/parent")}
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
            disabled={!isFormValid}
            className="bg-gradient-to-r from-purple-600 to-pink-700 hover:from-purple-700 hover:to-pink-800 px-8 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next: Welcome
            <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Button>
        </div>
      </div>
    </div>
  );
}