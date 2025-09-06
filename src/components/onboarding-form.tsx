"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";

interface ParentOnboardingData {
  fullName: string;
  phone: string;
  address: string;
  panCardNumber: string;
  alternateEmail: string;
  occupation: string;
  annualIncome: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  relationToStudent: string;
  studentName: string;
  studentRollNumber: string;
  studentDateOfBirth: string;
  studentClass: string;
  studentSection: string;
  institutionName: string;
  institutionAddress: string;
  previousSchool: string;
}

export default function OnboardingForm() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState<ParentOnboardingData>({
    fullName: "",
    phone: "",
    address: "",
    panCardNumber: "",
    alternateEmail: "",
    occupation: "",
    annualIncome: "",
    emergencyContactName: "",
    emergencyContactPhone: "",
    relationToStudent: "",
    studentName: "",
    studentRollNumber: "",
    studentDateOfBirth: "",
    studentClass: "",
    studentSection: "",
    institutionName: "",
    institutionAddress: "",
    previousSchool: "",
  });

  const handleInputChange = (field: keyof ParentOnboardingData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validatePAN = (pan: string) => {
    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    return panRegex.test(pan);
  };

  const validatePhone = (phone: string) => {
    const phoneRegex = /^[6-9]\d{9}$/;
    return phoneRegex.test(phone);
  };

  const validateForm = () => {
    const requiredFields: (keyof ParentOnboardingData)[] = [
      "fullName", "phone", "address", "panCardNumber", 
      "relationToStudent", "studentName", "institutionName"
    ];
    
    for (const field of requiredFields) {
      if (!formData[field].trim()) {
        alert(`Please fill in ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}`);
        return false;
      }
    }

    if (!validatePAN(formData.panCardNumber)) {
      alert("Please enter a valid PAN card number (e.g., ABCDE1234F)");
      return false;
    }

    if (!validatePhone(formData.phone)) {
      alert("Please enter a valid 10-digit mobile number");
      return false;
    }

    if (formData.emergencyContactPhone && !validatePhone(formData.emergencyContactPhone)) {
      alert("Please enter a valid emergency contact number");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setSubmitting(true);
    
    try {
      const response = await fetch("/api/parent/onboarding", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to save information");
      }

      const result = await response.json();
      
      router.push("/dashboard/parent");
    } catch (error) {
      console.error("Error submitting onboarding data:", error);
      alert(error instanceof Error ? error.message : "Failed to save information. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-2">Welcome to MyFee</h1>
            <p className="text-blue-100 text-lg">Complete your parent profile to get started</p>
            <div className="mt-4 flex justify-center">
              <div className="bg-white/20 rounded-full px-6 py-2">
                <span className="text-sm font-medium">Step 1 of 1: Parent & Student Information</span>
              </div>
            </div>
          </div>
        </div>

        {/* Form Content */}
        <div className="p-8 lg:p-12">
          <form onSubmit={handleSubmit} className="space-y-10">
            {/* Parent Information */}
            <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
              <div className="flex items-center mb-6">
                <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-semibold mr-3">1</div>
                <h3 className="text-2xl font-semibold text-gray-800">Parent Information</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name *</Label>
                  <Input
                    id="fullName"
                    value={formData.fullName}
                    onChange={(e) => handleInputChange("fullName", e.target.value)}
                    placeholder="Enter your full name"
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
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="relationToStudent">Relation to Student *</Label>
                  <select
                    id="relationToStudent"
                    value={formData.relationToStudent}
                    onChange={(e) => handleInputChange("relationToStudent", e.target.value)}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  >
                    <option value="">Select relation</option>
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
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  rows={4}
                />
              </div>
            </div>

            {/* Additional Information */}
            <div className="bg-green-50 rounded-xl p-6 border border-green-200">
              <div className="flex items-center mb-6">
                <div className="bg-green-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-semibold mr-3">2</div>
                <h3 className="text-2xl font-semibold text-gray-800">Additional Information</h3>
                <span className="ml-3 bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">Optional</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="alternateEmail">Alternate Email</Label>
                  <Input
                    id="alternateEmail"
                    type="email"
                    value={formData.alternateEmail}
                    onChange={(e) => handleInputChange("alternateEmail", e.target.value)}
                    placeholder="alternate@email.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="occupation">Occupation</Label>
                  <Input
                    id="occupation"
                    value={formData.occupation}
                    onChange={(e) => handleInputChange("occupation", e.target.value)}
                    placeholder="Enter your occupation"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="annualIncome">Annual Income (₹)</Label>
                  <Input
                    id="annualIncome"
                    type="number"
                    value={formData.annualIncome}
                    onChange={(e) => handleInputChange("annualIncome", e.target.value)}
                    placeholder="Enter annual income (helps with EMI eligibility)"
                  />
                  <p className="text-xs text-gray-500">This information helps us determine your EMI eligibility and payment plans</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="emergencyContactName">Emergency Contact Name</Label>
                  <Input
                    id="emergencyContactName"
                    value={formData.emergencyContactName}
                    onChange={(e) => handleInputChange("emergencyContactName", e.target.value)}
                    placeholder="Emergency contact person name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="emergencyContactPhone">Emergency Contact Phone</Label>
                  <Input
                    id="emergencyContactPhone"
                    value={formData.emergencyContactPhone}
                    onChange={(e) => handleInputChange("emergencyContactPhone", e.target.value)}
                    placeholder="Emergency contact number"
                    maxLength={10}
                  />
                </div>
              </div>
            </div>

            {/* Student Information */}
            <div className="bg-purple-50 rounded-xl p-6 border border-purple-200">
              <div className="flex items-center mb-6">
                <div className="bg-purple-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-semibold mr-3">3</div>
                <h3 className="text-2xl font-semibold text-gray-800">Student Information</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="studentName">Student Full Name *</Label>
                  <Input
                    id="studentName"
                    value={formData.studentName}
                    onChange={(e) => handleInputChange("studentName", e.target.value)}
                    placeholder="Enter student's full name as per official records"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="studentRollNumber">Student Roll/ID Number</Label>
                  <Input
                    id="studentRollNumber"
                    value={formData.studentRollNumber}
                    onChange={(e) => handleInputChange("studentRollNumber", e.target.value)}
                    placeholder="Enter student's roll number or ID"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="studentDateOfBirth">Student Date of Birth</Label>
                  <Input
                    id="studentDateOfBirth"
                    type="date"
                    value={formData.studentDateOfBirth}
                    onChange={(e) => handleInputChange("studentDateOfBirth", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="studentClass">Class/Grade</Label>
                  <Input
                    id="studentClass"
                    value={formData.studentClass}
                    onChange={(e) => handleInputChange("studentClass", e.target.value)}
                    placeholder="e.g., Class 10, Grade 5, B.Tech 1st Year"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="studentSection">Section</Label>
                  <Input
                    id="studentSection"
                    value={formData.studentSection}
                    onChange={(e) => handleInputChange("studentSection", e.target.value)}
                    placeholder="e.g., A, B, C"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="institutionName">Current Institution Name *</Label>
                  <Input
                    id="institutionName"
                    value={formData.institutionName}
                    onChange={(e) => handleInputChange("institutionName", e.target.value)}
                    placeholder="Enter current school/college name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="institutionAddress">Institution Address</Label>
                  <textarea
                    id="institutionAddress"
                    value={formData.institutionAddress}
                    onChange={(e) => handleInputChange("institutionAddress", e.target.value)}
                    placeholder="Enter complete institution address"
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:ring-2 focus:ring-ring focus:ring-offset-2"
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="previousSchool">Previous School (if applicable)</Label>
                  <Input
                    id="previousSchool"
                    value={formData.previousSchool}
                    onChange={(e) => handleInputChange("previousSchool", e.target.value)}
                    placeholder="Name of previous school/institution"
                  />
                </div>
              </div>
            </div>

            {/* Submit Section */}
            <div className="border-t pt-8">
              <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0 sm:space-x-4">
                <div className="flex items-center text-sm text-gray-600">
                  <svg className="w-4 h-4 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Your information is secure and encrypted
                </div>
                
                <div className="flex space-x-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push("/login/parent")}
                    className="px-6 py-2"
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={submitting}
                    className="bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 px-8 py-2 text-white font-semibold rounded-lg shadow-lg transform transition duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                  >
                    {submitting ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Saving Your Information...
                      </>
                    ) : (
                      "Complete Onboarding & Get Started"
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </form>
        </div>
        
        {/* Footer */}
        <div className="bg-gray-50 px-8 py-6 border-t">
          <div className="text-center text-sm text-gray-600">
            <p>Need help? Contact our support team at <span className="text-blue-600 font-medium">support@myfee.com</span></p>
            <p className="mt-1">By completing onboarding, you agree to our Terms of Service and Privacy Policy</p>
          </div>
        </div>
      </div>
    </div>
  );
}