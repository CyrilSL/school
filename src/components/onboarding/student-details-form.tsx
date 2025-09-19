"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import { useToast } from "~/hooks/use-toast";
import { Loader2 } from "lucide-react";

interface StudentDetailsData {
  studentName: string;
  studentRollNumber: string;
  studentDateOfBirth: string;
  studentClass: string;
  studentSection: string;
  institutionName: string;
  institutionAddress: string;
  previousSchool: string;
  feeAmount: string;
  feeType: string;
}

export default function StudentDetailsForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [formData, setFormData] = useState<StudentDetailsData>({
    studentName: "",
    studentRollNumber: "",
    studentDateOfBirth: "",
    studentClass: "",
    studentSection: "",
    institutionName: "",
    institutionAddress: "",
    previousSchool: "",
    feeAmount: "",
    feeType: "",
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load saved data
    const savedData = localStorage.getItem('onboarding-student-details');
    if (savedData) {
      setFormData(JSON.parse(savedData));
    }
    setLoading(false);
  }, []);

  const handleInputChange = (field: keyof StudentDetailsData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const saveProgress = () => {
    localStorage.setItem('onboarding-student-details', JSON.stringify(formData));
  };

  const validateForm = () => {
    const requiredFields: (keyof StudentDetailsData)[] = [
      "studentName", "institutionName", "feeAmount", "feeType"
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

    return true;
  };

  const handleNext = () => {
    if (!validateForm()) return;
    
    saveProgress();
    router.push("/parent/onboarding/steps/2");
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
        <div className="bg-blue-50 px-8 py-6 border-b border-blue-200">
          <div className="flex items-center mb-4">
            <div className="bg-blue-600 text-white rounded-full w-10 h-10 flex items-center justify-center font-semibold mr-4">1</div>
            <h2 className="text-3xl font-bold text-gray-800">Student Details</h2>
          </div>
          <p className="text-gray-600">Please provide your child's educational information</p>
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
              <Label htmlFor="feeType">Fee Type *</Label>
              <select
                id="feeType"
                value={formData.feeType}
                onChange={(e) => handleInputChange("feeType", e.target.value)}
                className="w-full h-12 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:ring-2 focus:ring-ring focus:ring-offset-2"
              >
                <option value="">Select fee type</option>
                <option value="Tuition Fee">Tuition Fee</option>
                <option value="Annual Fee">Annual Fee</option>
                <option value="Semester Fee">Semester Fee</option>
                <option value="Monthly Fee">Monthly Fee</option>
                <option value="Examination Fee">Examination Fee</option>
                <option value="Admission Fee">Admission Fee</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="feeAmount">Fee Amount (₹) *</Label>
              <Input
                id="feeAmount"
                type="number"
                value={formData.feeAmount}
                onChange={(e) => handleInputChange("feeAmount", e.target.value)}
                placeholder="Enter total fee amount"
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
            <Textarea
              id="institutionAddress"
              value={formData.institutionAddress}
              onChange={(e) => handleInputChange("institutionAddress", e.target.value)}
              placeholder="Complete address of the school or college"
              rows={3}
            />
          </div>

          {/* Info Card */}
          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
            <div className="flex items-start">
              <svg className="w-6 h-6 text-blue-600 mt-1 mr-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-2">Why we need this information</p>
                <p>This information helps us:</p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>Create the perfect EMI plan for your fee amount</li>
                  <li>Verify student enrollment with the institution</li>
                  <li>Process payments directly to the school/college</li>
                  <li>Maintain accurate payment records</li>
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
              onClick={() => router.push("/login/parent")}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleNext}
              className="bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 px-8 text-white"
            >
              Next: EMI Plan
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
