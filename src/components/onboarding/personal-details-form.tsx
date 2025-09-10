"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
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

  useEffect(() => {
    // Check if previous steps are completed
    const studentDetailsData = localStorage.getItem('onboarding-student-details');
    const emiPlanData = localStorage.getItem('onboarding-emi-plan');
    const parentPanData = localStorage.getItem('onboarding-parent-pan');
    
    if (!studentDetailsData || !emiPlanData || !parentPanData) {
      toast({
        title: "Please complete previous steps",
        description: "You need to complete the previous steps before proceeding.",
        variant: "destructive"
      });
      router.push("/onboarding/parent/steps/1");
      return;
    }

    // Pre-populate with data from previous steps
    const parentData = JSON.parse(parentPanData);
    setFormData(prev => ({
      ...prev,
      applicantPan: parentData.parentPan || "",
      email: parentData.parentEmail || "",
    }));

    // Load saved data
    const savedData = localStorage.getItem('onboarding-personal-details');
    if (savedData) {
      const parsed = JSON.parse(savedData);
      setFormData(prev => ({ ...prev, ...parsed }));
    }
    
    setLoading(false);
  }, [router]);

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
        toast({
          title: "Missing required field",
          description: `Please fill in ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}`,
          variant: "destructive"
        });
        return false;
      }
    }

    // Validate PAN format
    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    if (!panRegex.test(formData.applicantPan)) {
      toast({
        title: "Invalid PAN number",
        description: "Please enter a valid PAN number (e.g., ABCDE1234F)",
        variant: "destructive"
      });
      return false;
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast({
        title: "Invalid email address",
        description: "Please enter a valid email address",
        variant: "destructive"
      });
      return false;
    }

    // Validate alternate phone if provided
    if (formData.alternatePhone && !/^[6-9]\d{9}$/.test(formData.alternatePhone)) {
      toast({
        title: "Invalid alternate phone number",
        description: "Please enter a valid 10-digit mobile number",
        variant: "destructive"
      });
      return false;
    }

    // Check if spouse name is required
    if (formData.maritalStatus === "Married" && !formData.spouseName.trim()) {
      toast({
        title: "Spouse name required",
        description: "Please enter your spouse's name as you're married",
        variant: "destructive"
      });
      return false;
    }

    return true;
  };

  const handleNext = () => {
    if (!validateForm()) return;
    
    saveProgress();
    router.push("/onboarding/parent/steps/6");
  };

  const handleBack = () => {
    saveProgress();
    router.push("/onboarding/parent/steps/4");
  };

  const handleSaveAndExit = () => {
    saveProgress();
    toast({
      title: "Progress saved",
      description: "Your progress has been saved. You can continue later from your dashboard."
    });
    router.push("/dashboard/parent");
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
                disabled
              />
              <p className="text-sm text-gray-500">This is pre-filled from your parent PAN details</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="gender">Gender *</Label>
              <select
                id="gender"
                value={formData.gender}
                onChange={(e) => handleInputChange("gender", e.target.value)}
                className="w-full h-12 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:ring-2 focus:ring-ring focus:ring-offset-2"
              >
                <option value="">Select gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
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
              <select
                id="maritalStatus"
                value={formData.maritalStatus}
                onChange={(e) => handleInputChange("maritalStatus", e.target.value)}
                className="w-full h-12 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:ring-2 focus:ring-ring focus:ring-offset-2"
              >
                <option value="">Select marital status</option>
                <option value="Single">Single</option>
                <option value="Married">Married</option>
                <option value="Divorced">Divorced</option>
                <option value="Widowed">Widowed</option>
              </select>
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
              <select
                id="educationLevel"
                value={formData.educationLevel}
                onChange={(e) => handleInputChange("educationLevel", e.target.value)}
                className="w-full h-12 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:ring-2 focus:ring-ring focus:ring-offset-2"
              >
                <option value="">Select education level</option>
                <option value="High School">High School</option>
                <option value="Diploma">Diploma</option>
                <option value="Bachelor's Degree">Bachelor's Degree</option>
                <option value="Master's Degree">Master's Degree</option>
                <option value="PhD">PhD</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="workExperience">Work Experience</Label>
              <select
                id="workExperience"
                value={formData.workExperience}
                onChange={(e) => handleInputChange("workExperience", e.target.value)}
                className="w-full h-12 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:ring-2 focus:ring-ring focus:ring-offset-2"
              >
                <option value="">Select work experience</option>
                <option value="0-2 years">0-2 years</option>
                <option value="2-5 years">2-5 years</option>
                <option value="5-10 years">5-10 years</option>
                <option value="10-15 years">10-15 years</option>
                <option value="15+ years">15+ years</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="companyType">Company Type</Label>
              <select
                id="companyType"
                value={formData.companyType}
                onChange={(e) => handleInputChange("companyType", e.target.value)}
                className="w-full h-12 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:ring-2 focus:ring-ring focus:ring-offset-2"
              >
                <option value="">Select company type</option>
                <option value="Government">Government</option>
                <option value="Public Sector">Public Sector</option>
                <option value="Private Limited">Private Limited</option>
                <option value="MNC">MNC</option>
                <option value="Self Employed">Self Employed</option>
                <option value="Partnership">Partnership</option>
                <option value="Proprietorship">Proprietorship</option>
              </select>
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
              className="bg-gradient-to-r from-green-600 to-teal-700 hover:from-green-700 hover:to-teal-800 px-8"
            >
              Final Step: Confirmation
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