"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import { useToast } from "~/hooks/use-toast";

interface ParentInfoData {
  fullName: string;
  phone: string;
  address: string;
  panCardNumber: string;
  relationToStudent: string;
}

export default function ParentInfoForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [formData, setFormData] = useState<ParentInfoData>({
    fullName: "",
    phone: "",
    address: "",
    panCardNumber: "",
    relationToStudent: "",
  });
  const [loading, setLoading] = useState(true);
  const [isFormValid, setIsFormValid] = useState(false);

  useEffect(() => {
    // Load saved data from localStorage or API
    const savedData = localStorage.getItem('onboarding-parent-info');
    if (savedData) {
      setFormData(JSON.parse(savedData));
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    setIsFormValid(validateForm());
  }, [formData]);

  const handleInputChange = (field: keyof ParentInfoData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const saveProgress = () => {
    localStorage.setItem('onboarding-parent-info', JSON.stringify(formData));
  };

  const validateForm = () => {
    const requiredFields: (keyof ParentInfoData)[] = [
      "fullName", "phone", "address", "panCardNumber", "relationToStudent"
    ];
    
    for (const field of requiredFields) {
      if (!formData[field].trim()) {
        return false;
      }
    }

    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    if (!panRegex.test(formData.panCardNumber)) {
      return false;
    }

    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(formData.phone)) {
      return false;
    }

    return true;
  };

  const handleNext = () => {
    if (!validateForm()) return;
    
    saveProgress();
    router.push("/parent/apply/steps/2");
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
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="bg-blue-50 px-8 py-6 border-b border-blue-200">
          <div className="flex items-center mb-4">
            <div className="bg-blue-600 text-white rounded-full w-10 h-10 flex items-center justify-center font-semibold mr-4">1</div>
            <h2 className="text-3xl font-bold text-gray-800">Parent Information</h2>
          </div>
          <p className="text-gray-600">Please provide your personal details to get started</p>
        </div>

        <div className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name *</Label>
              <Input
                id="fullName"
                value={formData.fullName}
                onChange={(e) => handleInputChange("fullName", e.target.value)}
                placeholder="Enter your full name as per official documents"
                className="h-12"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Mobile Number *</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => handleInputChange("phone", e.target.value)}
                placeholder="Enter 10-digit mobile number"
                maxLength={10}
                className="h-12"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="panCardNumber">PAN Card Number *</Label>
              <Input
                id="panCardNumber"
                value={formData.panCardNumber}
                onChange={(e) => handleInputChange("panCardNumber", e.target.value.toUpperCase())}
                placeholder="ABCDE1234F"
                maxLength={10}
                className="h-12"
              />
              <p className="text-sm text-gray-500">Format: 5 letters + 4 digits + 1 letter</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="relationToStudent">Relation to Student *</Label>
              <select
                id="relationToStudent"
                value={formData.relationToStudent}
                onChange={(e) => handleInputChange("relationToStudent", e.target.value)}
                className="w-full h-12 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:ring-2 focus:ring-ring focus:ring-offset-2"
              >
                <option value="">Select your relation</option>
                <option value="Father">Father</option>
                <option value="Mother">Mother</option>
                <option value="Guardian">Guardian</option>
                <option value="Uncle">Uncle</option>
                <option value="Aunt">Aunt</option>
                <option value="Grandparent">Grandparent</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div className="space-y-2 mt-6">
            <Label htmlFor="address">Complete Address *</Label>
            <textarea
              id="address"
              value={formData.address}
              onChange={(e) => handleInputChange("address", e.target.value)}
              placeholder="Enter your complete residential address including city, state, and pincode"
              className="w-full rounded-md border border-input bg-background px-3 py-3 text-sm ring-offset-background placeholder:text-muted-foreground focus:ring-2 focus:ring-ring focus:ring-offset-2"
              rows={4}
            />
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
              onClick={() => router.push("/login/parent")}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleNext}
              disabled={!isFormValid}
              className="bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 px-8 disabled:opacity-50 disabled:cursor-not-allowed text-white"
            >
              Next: Additional Info
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
