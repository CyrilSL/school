"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";

interface StudentInfoData {
  studentName: string;
  studentRollNumber: string;
  studentDateOfBirth: string;
  studentClass: string;
  studentSection: string;
  institutionName: string;
  institutionAddress: string;
  previousSchool: string;
}

export default function StudentInfoForm() {
  const router = useRouter();
  const [formData, setFormData] = useState<StudentInfoData>({
    studentName: "",
    studentRollNumber: "",
    studentDateOfBirth: "",
    studentClass: "",
    studentSection: "",
    institutionName: "",
    institutionAddress: "",
    previousSchool: "",
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    // Check if Step 1 is completed
    const parentInfoData = localStorage.getItem('onboarding-parent-info');
    if (!parentInfoData) {
      alert("Please complete Step 1 first");
      router.push("/onboarding/parent/steps/1");
      return;
    }

    // Load saved data
    const savedData = localStorage.getItem('onboarding-student-info');
    if (savedData) {
      setFormData(JSON.parse(savedData));
    }
    setLoading(false);
  }, [router]);

  const handleInputChange = (field: keyof StudentInfoData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const saveProgress = () => {
    localStorage.setItem('onboarding-student-info', JSON.stringify(formData));
  };

  const validateForm = () => {
    const requiredFields: (keyof StudentInfoData)[] = [
      "studentName", "institutionName"
    ];
    
    for (const field of requiredFields) {
      if (!formData[field].trim()) {
        alert(`Please fill in ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}`);
        return false;
      }
    }

    return true;
  };

  const handleComplete = async () => {
    if (!validateForm()) return;

    saveProgress();
    setSubmitting(true);

    try {
      // Combine all form data
      const parentInfo = JSON.parse(localStorage.getItem('onboarding-parent-info') || '{}');
      const additionalInfo = JSON.parse(localStorage.getItem('onboarding-additional-info') || '{}');
      
      const completeData = {
        ...parentInfo,
        ...additionalInfo,
        ...formData
      };

      const response = await fetch("/api/parent/onboarding", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(completeData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to save information");
      }

      // Clear saved data
      localStorage.removeItem('onboarding-parent-info');
      localStorage.removeItem('onboarding-additional-info');
      localStorage.removeItem('onboarding-student-info');

      alert("Onboarding completed successfully! Welcome to MyFee.");
      router.push("/dashboard/parent");
    } catch (error) {
      console.error("Error completing onboarding:", error);
      alert(error instanceof Error ? error.message : "Failed to save information. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleBack = () => {
    saveProgress();
    router.push("/onboarding/parent/steps/2");
  };

  const handleSaveAndExit = () => {
    saveProgress();
    alert("Your progress has been saved. You can continue later from your dashboard.");
    router.push("/dashboard/parent");
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
        <div className="bg-purple-50 px-8 py-6 border-b border-purple-200">
          <div className="flex items-center mb-4">
            <div className="bg-purple-600 text-white rounded-full w-10 h-10 flex items-center justify-center font-semibold mr-4">3</div>
            <h2 className="text-3xl font-bold text-gray-800">Student Information</h2>
          </div>
          <p className="text-gray-600">Please provide details about your child's education</p>
        </div>

        <div className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label htmlFor="studentName">Student Full Name *</Label>
              <Input
                id="studentName"
                value={formData.studentName}
                onChange={(e) => handleInputChange("studentName", e.target.value)}
                placeholder="Enter student's full name as per records"
                className="h-12"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="institutionName">Current Institution *</Label>
              <Input
                id="institutionName"
                value={formData.institutionName}
                onChange={(e) => handleInputChange("institutionName", e.target.value)}
                placeholder="School or college name"
                className="h-12"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="studentRollNumber">Roll/ID Number</Label>
              <Input
                id="studentRollNumber"
                value={formData.studentRollNumber}
                onChange={(e) => handleInputChange("studentRollNumber", e.target.value)}
                placeholder="Student's roll number or ID"
                className="h-12"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="studentDateOfBirth">Date of Birth</Label>
              <Input
                id="studentDateOfBirth"
                type="date"
                value={formData.studentDateOfBirth}
                onChange={(e) => handleInputChange("studentDateOfBirth", e.target.value)}
                className="h-12"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="studentClass">Class/Grade</Label>
              <Input
                id="studentClass"
                value={formData.studentClass}
                onChange={(e) => handleInputChange("studentClass", e.target.value)}
                placeholder="e.g., Class 10, Grade 5, B.Tech 1st Year"
                className="h-12"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="studentSection">Section</Label>
              <Input
                id="studentSection"
                value={formData.studentSection}
                onChange={(e) => handleInputChange("studentSection", e.target.value)}
                placeholder="e.g., A, B, C"
                className="h-12"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="previousSchool">Previous School</Label>
              <Input
                id="previousSchool"
                value={formData.previousSchool}
                onChange={(e) => handleInputChange("previousSchool", e.target.value)}
                placeholder="Previous institution (if applicable)"
                className="h-12"
              />
            </div>
          </div>

          <div className="space-y-2 mt-6">
            <Label htmlFor="institutionAddress">Institution Address</Label>
            <textarea
              id="institutionAddress"
              value={formData.institutionAddress}
              onChange={(e) => handleInputChange("institutionAddress", e.target.value)}
              placeholder="Complete address of the school or college"
              className="w-full rounded-md border border-input bg-background px-3 py-3 text-sm ring-offset-background placeholder:text-muted-foreground focus:ring-2 focus:ring-ring focus:ring-offset-2"
              rows={3}
            />
          </div>

          {/* Success Message */}
          <div className="mt-8 bg-green-50 border border-green-200 rounded-lg p-6">
            <div className="flex items-start">
              <svg className="w-6 h-6 text-green-600 mt-1 mr-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <div className="text-sm text-green-800">
                <p className="font-medium mb-2">Almost done! 🎉</p>
                <p>After completing this step, you'll have access to:</p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>Apply for zero-interest EMI plans</li>
                  <li>Track fee payments and installments</li>
                  <li>Manage your child's education expenses</li>
                  <li>Access exclusive offers and benefits</li>
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
              onClick={handleComplete}
              disabled={submitting}
              className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 px-8 py-3 text-white font-semibold rounded-lg shadow-lg transform transition duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {submitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Completing Setup...
                </>
              ) : (
                <>
                  Complete Onboarding
                  <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
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