"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { useToast } from "~/hooks/use-toast";

interface AdditionalInfoData {
  alternateEmail: string;
  occupation: string;
  annualIncome: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
}

export default function AdditionalInfoForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [formData, setFormData] = useState<AdditionalInfoData>({
    alternateEmail: "",
    occupation: "",
    annualIncome: "",
    emergencyContactName: "",
    emergencyContactPhone: "",
  });
  const [loading, setLoading] = useState(true);
  const [isFormValid, setIsFormValid] = useState(true); // Optional form, so valid by default

  useEffect(() => {
    // Check if Step 1 is completed
    const parentInfoData = localStorage.getItem('onboarding-parent-info');
    if (!parentInfoData) {
      toast({
        title: "Please complete Step 1 first",
        description: "You need to complete the parent information step before proceeding.",
        variant: "destructive"
      });
      router.push("/parent/onboarding/steps/1");
      return;
    }

    // Load saved data
    const savedData = localStorage.getItem('onboarding-additional-info');
    if (savedData) {
      setFormData(JSON.parse(savedData));
    }
    setLoading(false);
  }, [router]);

  useEffect(() => {
    setIsFormValid(validateForm());
  }, [formData]);

  const handleInputChange = (field: keyof AdditionalInfoData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const saveProgress = () => {
    localStorage.setItem('onboarding-additional-info', JSON.stringify(formData));
  };

  const validatePhone = (phone: string) => {
    if (!phone) return true; // Optional field
    const phoneRegex = /^[6-9]\d{9}$/;
    return phoneRegex.test(phone);
  };

  const validateForm = () => {
    if (formData.emergencyContactPhone && !validatePhone(formData.emergencyContactPhone)) {
      return false;
    }

    if (formData.alternateEmail && !/\S+@\S+\.\S+/.test(formData.alternateEmail)) {
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

  const handleSkip = () => {
    saveProgress();
    router.push("/parent/onboarding/steps/3");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="bg-green-50 px-8 py-6 border-b border-green-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <div className="bg-green-600 text-white rounded-full w-10 h-10 flex items-center justify-center font-semibold mr-4">2</div>
              <h2 className="text-3xl font-bold text-gray-800">Additional Information</h2>
            </div>
            <span className="bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-medium">Optional</span>
          </div>
          <p className="text-gray-600">This information helps us provide better services and EMI options</p>
        </div>

        <div className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="alternateEmail">Alternate Email</Label>
              <Input
                id="alternateEmail"
                type="email"
                value={formData.alternateEmail}
                onChange={(e) => handleInputChange("alternateEmail", e.target.value)}
                placeholder="alternate@email.com"
                className="h-12"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="occupation">Occupation</Label>
              <Input
                id="occupation"
                value={formData.occupation}
                onChange={(e) => handleInputChange("occupation", e.target.value)}
                placeholder="Your profession or job title"
                className="h-12"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="annualIncome">Annual Income (₹)</Label>
              <Input
                id="annualIncome"
                type="number"
                value={formData.annualIncome}
                onChange={(e) => handleInputChange("annualIncome", e.target.value)}
                placeholder="Your yearly income"
                className="h-12"
              />
              <p className="text-sm text-gray-500">Helps us determine your EMI eligibility and payment plans</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="emergencyContactName">Emergency Contact Name</Label>
              <Input
                id="emergencyContactName"
                value={formData.emergencyContactName}
                onChange={(e) => handleInputChange("emergencyContactName", e.target.value)}
                placeholder="Name of emergency contact person"
                className="h-12"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="emergencyContactPhone">Emergency Contact Phone</Label>
              <Input
                id="emergencyContactPhone"
                value={formData.emergencyContactPhone}
                onChange={(e) => handleInputChange("emergencyContactPhone", e.target.value)}
                placeholder="Emergency contact mobile number"
                maxLength={10}
                className="h-12 max-w-md"
              />
            </div>
          </div>

          {/* Info Box */}
          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
            <div className="flex items-start">
              <svg className="w-5 h-5 text-blue-600 mt-1 mr-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">Why do we collect this information?</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Annual income helps us offer suitable EMI plans</li>
                  <li>Emergency contact ensures we can reach someone if needed</li>
                  <li>Alternate email provides backup communication</li>
                  <li>All information is kept secure and confidential</li>
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
            <Button
              type="button"
              variant="ghost"
              onClick={handleSkip}
              className="text-gray-600"
            >
              Skip This Step
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
              disabled={!isFormValid}
              className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 px-8 disabled:opacity-50 disabled:cursor-not-allowed text-white"
            >
              Next: Student Info
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
