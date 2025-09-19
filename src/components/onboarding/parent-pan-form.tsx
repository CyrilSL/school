"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import { useToast } from "~/hooks/use-toast";
import { Loader2 } from "lucide-react";

interface ParentPanData {
  parentName: string;
  parentPan: string;
  parentPhone: string;
  parentEmail: string;
  parentAddress: string;
  relationToStudent: string;
  monthlyIncome: string;
  occupation: string;
  employer: string;
}

export default function ParentPanForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [formData, setFormData] = useState<ParentPanData>({
    parentName: "",
    parentPan: "",
    parentPhone: "",
    parentEmail: "",
    parentAddress: "",
    relationToStudent: "",
    monthlyIncome: "",
    occupation: "",
    employer: "",
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if previous steps are completed
    const studentDetailsData = localStorage.getItem('onboarding-student-details');
    const emiPlanData = localStorage.getItem('onboarding-emi-plan');
    
    if (!studentDetailsData || !emiPlanData) {
      toast({
    // Validation removed - allow direct access to all steps
    }

    // Load saved data
    const savedData = localStorage.getItem('onboarding-parent-pan');
    if (savedData) {
      setFormData(JSON.parse(savedData));
    }
    setLoading(false);
  }, [router]);

  const handleInputChange = (field: keyof ParentPanData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const saveProgress = () => {
    localStorage.setItem('onboarding-parent-pan', JSON.stringify(formData));
  };

  const validateForm = () => {
    const requiredFields: (keyof ParentPanData)[] = [
      "parentName", "parentPan", "parentPhone", "parentEmail", 
      "parentAddress", "relationToStudent", "monthlyIncome"
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
    if (!panRegex.test(formData.parentPan)) {
      toast({
        title: "Invalid PAN number",
        description: "Please enter a valid PAN number (e.g., ABCDE1234F)",
        variant: "destructive"
      });
      return false;
    }

    // Validate phone number
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(formData.parentPhone)) {
      toast({
        title: "Invalid phone number",
        description: "Please enter a valid 10-digit mobile number",
        variant: "destructive"
      });
      return false;
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.parentEmail)) {
      toast({
        title: "Invalid email address",
        description: "Please enter a valid email address",
        variant: "destructive"
      });
      return false;
    }

    return true;
  };

  const handleNext = () => {
    if (!validateForm()) return;
    
    saveProgress();
    router.push("/parent/onboarding/steps/4");
  };

  const handleBack = () => {
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
        <div className="bg-purple-50 px-8 py-6 border-b border-purple-200">
          <div className="flex items-center mb-4">
            <div className="bg-purple-600 text-white rounded-full w-10 h-10 flex items-center justify-center font-semibold mr-4">3</div>
            <h2 className="text-3xl font-bold text-gray-800">Parent PAN Details</h2>
          </div>
          <p className="text-gray-600">Primary earning member information (for loan approval)</p>
        </div>

        <div className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="parentName">Full Name (as per PAN) *</Label>
              <Input
                id="parentName"
                value={formData.parentName}
                onChange={(e) => handleInputChange("parentName", e.target.value)}
                placeholder="Enter full name exactly as on PAN card"
                className="h-12"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="parentPan">PAN Card Number *</Label>
              <Input
                id="parentPan"
                value={formData.parentPan}
                onChange={(e) => handleInputChange("parentPan", e.target.value.toUpperCase())}
                placeholder="ABCDE1234F"
                maxLength={10}
                className="h-12"
              />
              <p className="text-sm text-gray-500">Format: 5 letters + 4 digits + 1 letter</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="parentPhone">Mobile Number *</Label>
              <Input
                id="parentPhone"
                value={formData.parentPhone}
                onChange={(e) => handleInputChange("parentPhone", e.target.value)}
                placeholder="Enter 10-digit mobile number"
                maxLength={10}
                className="h-12"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="parentEmail">Email Address *</Label>
              <Input
                id="parentEmail"
                type="email"
                value={formData.parentEmail}
                onChange={(e) => handleInputChange("parentEmail", e.target.value)}
                placeholder="your.email@example.com"
                className="h-12"
              />
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

            <div className="space-y-2">
              <Label htmlFor="monthlyIncome">Monthly Income (₹) *</Label>
              <select
                id="monthlyIncome"
                value={formData.monthlyIncome}
                onChange={(e) => handleInputChange("monthlyIncome", e.target.value)}
                className="w-full h-12 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:ring-2 focus:ring-ring focus:ring-offset-2"
              >
                <option value="">Select monthly income range</option>
                <option value="25000-50000">₹25,000 - ₹50,000</option>
                <option value="50000-75000">₹50,000 - ₹75,000</option>
                <option value="75000-100000">₹75,000 - ₹1,00,000</option>
                <option value="100000-150000">₹1,00,000 - ₹1,50,000</option>
                <option value="150000-200000">₹1,50,000 - ₹2,00,000</option>
                <option value="200000+">₹2,00,000+</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="occupation">Occupation</Label>
              <Input
                id="occupation"
                value={formData.occupation}
                onChange={(e) => handleInputChange("occupation", e.target.value)}
                placeholder="e.g., Software Engineer, Teacher, Business Owner"
                className="h-12"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="employer">Employer/Company Name</Label>
              <Input
                id="employer"
                value={formData.employer}
                onChange={(e) => handleInputChange("employer", e.target.value)}
                placeholder="Current employer or company name"
                className="h-12"
              />
            </div>
          </div>

          <div className="space-y-2 mt-6">
            <Label htmlFor="parentAddress">Complete Address *</Label>
            <Textarea
              id="parentAddress"
              value={formData.parentAddress}
              onChange={(e) => handleInputChange("parentAddress", e.target.value)}
              placeholder="Enter complete address including city, state, and pincode"
              rows={4}
            />
          </div>

          {/* Security Note */}
          <div className="mt-8 bg-green-50 border border-green-200 rounded-lg p-6">
            <div className="flex items-start">
              <svg className="w-6 h-6 text-green-600 mt-1 mr-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <div className="text-sm text-green-800">
                <p className="font-medium mb-2">🔒 Your information is secure</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>All data is encrypted and stored securely</li>
                  <li>PAN information is used only for loan verification</li>
                  <li>We comply with RBI guidelines for financial data</li>
                  <li>Information will not be shared with third parties</li>
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
              className="bg-gradient-to-r from-purple-600 to-pink-700 hover:from-purple-700 hover:to-pink-800 px-8 text-white"
            >
              Next: Welcome
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
