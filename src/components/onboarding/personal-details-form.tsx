"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { useToast } from "~/hooks/use-toast";
import { Loader2 } from "lucide-react";

interface PersonalDetailsData {
  applicantPan: string;
  gender: string;
  dateOfBirth: string;
  maritalStatus: string;
  email: string;
  alternatePhone: string;
  fatherName: string;
  motherName: string;
  spouseName: string;
  educationLevel: string;
  workExperience: string;
  companyType: string;
}

export default function PersonalDetailsForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [formData, setFormData] = useState<PersonalDetailsData>({
    applicantPan: "",
    gender: "",
    dateOfBirth: "",
    maritalStatus: "",
    email: "",
    alternatePhone: "",
    fatherName: "",
    motherName: "",
    spouseName: "",
    educationLevel: "",
    workExperience: "",
    companyType: "",
  });
  const [loading, setLoading] = useState(true);
  const [isFormValid, setIsFormValid] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    // Check if previous steps are completed
    const studentDetailsData = localStorage.getItem('onboarding-student-details');
    const emiPlanData = localStorage.getItem('onboarding-emi-plan');
    const parentPanData = localStorage.getItem('onboarding-parent-pan');
    
    if (!studentDetailsData || !emiPlanData || !parentPanData) {
      // Validation removed - allow direct access to all steps
    }

    // Pre-populate with data from previous steps
    if (parentPanData) {
      const parentData = JSON.parse(parentPanData);
      setFormData(prev => ({
        ...prev,
        applicantPan: parentData.parentPan || "",
        email: parentData.parentEmail || "",
      }));
    }

    // Load saved data
    const savedData = localStorage.getItem('onboarding-personal-details');
    if (savedData) {
      const parsed = JSON.parse(savedData);
      setFormData(prev => ({ ...prev, ...parsed }));
    }
    
    setLoading(false);
  }, [router]);

  useEffect(() => {
    setIsFormValid(validateForm());
  }, [formData]);

  const handleInputChange = (field: keyof PersonalDetailsData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const saveProgress = () => {
    localStorage.setItem('onboarding-personal-details', JSON.stringify(formData));
  };

  const validateForm = () => {
    const requiredFields: (keyof PersonalDetailsData)[] = [
      "applicantPan", "gender", "dateOfBirth", "maritalStatus", 
      "email", "fatherName", "motherName"
    ];
    
    for (const field of requiredFields) {
      if (!formData[field].trim()) {
        return false;
      }
    }

    // Validate PAN format
    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    if (!panRegex.test(formData.applicantPan)) {
      return false;
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      return false;
    }

    // Validate alternate phone if provided
    if (formData.alternatePhone && !/^[6-9]\d{9}$/.test(formData.alternatePhone)) {
      return false;
    }

    // Check if spouse name is required
    if (formData.maritalStatus === "Married" && !formData.spouseName.trim()) {
      return false;
    }

    return true;
  };

  const saveToDatabase = async () => {
    try {
      const response = await fetch("/api/parent/onboarding/partial", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          step: 5,
          data: {
            applicantPan: formData.applicantPan,
            gender: formData.gender,
            dateOfBirth: formData.dateOfBirth,
            maritalStatus: formData.maritalStatus,
            email: formData.email,
            alternatePhone: formData.alternatePhone,
            fatherName: formData.fatherName,
            motherName: formData.motherName,
            spouseName: formData.spouseName,
            educationLevel: formData.educationLevel,
            workExperience: formData.workExperience,
            companyType: formData.companyType,
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

  const handleNext = async () => {
    if (!validateForm()) return;

    setIsSaving(true);

    // Save to localStorage (keep existing functionality)
    saveProgress();

    // Save to database
    const saved = await saveToDatabase();

    setIsSaving(false);

    if (saved) {
      router.push("/parent/onboarding/steps/6");
    }
  };

  const handleBack = () => {
    saveProgress();
    router.push("/parent/onboarding/steps/4");
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
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="bg-green-50 px-8 py-6 border-b border-green-200">
          <div className="flex items-center mb-4">
            <div className="bg-green-600 text-white rounded-full w-10 h-10 flex items-center justify-center font-semibold mr-4">5</div>
            <h2 className="text-3xl font-bold text-gray-800">Personal Details for Loan Application</h2>
          </div>
          <p className="text-gray-600">Complete your KYC information for loan approval</p>
        </div>

        <div className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Information */}
            <div className="md:col-span-2">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Basic Information</h3>
            </div>

            <div className="space-y-2">
              <Label htmlFor="applicantPan">PAN Card Number *</Label>
              <Input
                id="applicantPan"
                value={formData.applicantPan}
                onChange={(e) => handleInputChange("applicantPan", e.target.value.toUpperCase())}
                placeholder="ABCDE1234F"
                maxLength={10}
                className="h-12"
              />
              <p className="text-sm text-gray-500">This is pre-filled from your parent PAN details</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="gender">Gender *</Label>
              <Select value={formData.gender} onValueChange={(value) => handleInputChange("gender", value)}>
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent className="bg-white border border-gray-200 shadow-lg">
                  <SelectItem value="Male">Male</SelectItem>
                  <SelectItem value="Female">Female</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="dateOfBirth">Date of Birth *</Label>
              <Input
                id="dateOfBirth"
                type="date"
                value={formData.dateOfBirth}
                onChange={(e) => handleInputChange("dateOfBirth", e.target.value)}
                className="h-12"
                max={new Date(new Date().setFullYear(new Date().getFullYear() - 18)).toISOString().split('T')[0]}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="maritalStatus">Marital Status *</Label>
              <Select value={formData.maritalStatus} onValueChange={(value) => handleInputChange("maritalStatus", value)}>
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="Select marital status" />
                </SelectTrigger>
                <SelectContent className="bg-white border border-gray-200 shadow-lg">
                  <SelectItem value="Single">Single</SelectItem>
                  <SelectItem value="Married">Married</SelectItem>
                  <SelectItem value="Divorced">Divorced</SelectItem>
                  <SelectItem value="Widowed">Widowed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                placeholder="your.email@example.com"
                className="h-12"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="alternatePhone">Alternate Phone Number</Label>
              <Input
                id="alternatePhone"
                value={formData.alternatePhone}
                onChange={(e) => handleInputChange("alternatePhone", e.target.value)}
                placeholder="Enter 10-digit mobile number"
                maxLength={10}
                className="h-12"
              />
            </div>

            {/* Family Information */}
            <div className="md:col-span-2 mt-8">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Family Information</h3>
            </div>

            <div className="space-y-2">
              <Label htmlFor="fatherName">Father's Full Name *</Label>
              <Input
                id="fatherName"
                value={formData.fatherName}
                onChange={(e) => handleInputChange("fatherName", e.target.value)}
                placeholder="Enter father's full name"
                className="h-12"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="motherName">Mother's Full Name *</Label>
              <Input
                id="motherName"
                value={formData.motherName}
                onChange={(e) => handleInputChange("motherName", e.target.value)}
                placeholder="Enter mother's full name"
                className="h-12"
              />
            </div>

            {formData.maritalStatus === "Married" && (
              <div className="space-y-2">
                <Label htmlFor="spouseName">Spouse's Full Name *</Label>
                <Input
                  id="spouseName"
                  value={formData.spouseName}
                  onChange={(e) => handleInputChange("spouseName", e.target.value)}
                  placeholder="Enter spouse's full name"
                  className="h-12"
                />
              </div>
            )}

            {/* Professional Information */}
            <div className="md:col-span-2 mt-8">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Professional Information (Optional)</h3>
            </div>

            <div className="space-y-2">
              <Label htmlFor="educationLevel">Highest Education Level</Label>
              <Select value={formData.educationLevel} onValueChange={(value) => handleInputChange("educationLevel", value)}>
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="Select education level" />
                </SelectTrigger>
                <SelectContent className="bg-white border border-gray-200 shadow-lg">
                  <SelectItem value="High School">High School</SelectItem>
                  <SelectItem value="Diploma">Diploma</SelectItem>
                  <SelectItem value="Bachelor's Degree">Bachelor's Degree</SelectItem>
                  <SelectItem value="Master's Degree">Master's Degree</SelectItem>
                  <SelectItem value="PhD">PhD</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="workExperience">Work Experience</Label>
              <Select value={formData.workExperience} onValueChange={(value) => handleInputChange("workExperience", value)}>
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="Select work experience" />
                </SelectTrigger>
                <SelectContent className="bg-white border border-gray-200 shadow-lg">
                  <SelectItem value="0-2 years">0-2 years</SelectItem>
                  <SelectItem value="2-5 years">2-5 years</SelectItem>
                  <SelectItem value="5-10 years">5-10 years</SelectItem>
                  <SelectItem value="10-15 years">10-15 years</SelectItem>
                  <SelectItem value="15+ years">15+ years</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="companyType">Company Type</Label>
              <Select value={formData.companyType} onValueChange={(value) => handleInputChange("companyType", value)}>
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="Select company type" />
                </SelectTrigger>
                <SelectContent className="bg-white border border-gray-200 shadow-lg">
                  <SelectItem value="Government">Government</SelectItem>
                  <SelectItem value="Public Sector">Public Sector</SelectItem>
                  <SelectItem value="Private Limited">Private Limited</SelectItem>
                  <SelectItem value="MNC">MNC</SelectItem>
                  <SelectItem value="Self Employed">Self Employed</SelectItem>
                  <SelectItem value="Partnership">Partnership</SelectItem>
                  <SelectItem value="Proprietorship">Proprietorship</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Important Note */}
          <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <div className="flex items-start">
              <svg className="w-6 h-6 text-yellow-600 mt-1 mr-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <div className="text-sm text-yellow-800">
                <p className="font-medium mb-2">Important Information</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>All information must match your official documents</li>
                  <li>Any mismatch may result in loan rejection</li>
                  <li>PAN and Aadhaar verification will be done automatically</li>
                  <li>This information is securely encrypted and stored</li>
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
              disabled={!isFormValid || isSaving}
              className="bg-gradient-to-r from-green-600 to-teal-700 hover:from-green-700 hover:to-teal-800 px-8 disabled:opacity-50 disabled:cursor-not-allowed text-white"
            >
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  Final Step: Confirmation
                  <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
