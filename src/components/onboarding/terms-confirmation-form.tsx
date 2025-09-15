"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Checkbox } from "~/components/ui/checkbox";
import { useToast } from "~/hooks/use-toast";
import { Loader2, CheckCircle, FileText, Shield, CreditCard } from "lucide-react";

interface ConfirmationData {
  termsAccepted: boolean;
  privacyAccepted: boolean;
  creditCheckConsent: boolean;
  communicationConsent: boolean;
}

export default function TermsConfirmationForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [formData, setFormData] = useState<ConfirmationData>({
    termsAccepted: false,
    privacyAccepted: false,
    creditCheckConsent: false,
    communicationConsent: false,
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [applicationSummary, setApplicationSummary] = useState<any>(null);

  useEffect(() => {
    // Check if all previous steps are completed
    const studentDetailsData = localStorage.getItem('onboarding-student-details');
    const emiPlanData = localStorage.getItem('onboarding-emi-plan');
    const parentPanData = localStorage.getItem('onboarding-parent-pan');
    const personalDetailsData = localStorage.getItem('onboarding-personal-details');
    
    if (!studentDetailsData || !emiPlanData || !parentPanData || !personalDetailsData) {
      // Validation removed - allow direct access to all steps
      setLoading(false);
      return;
    }

    // Build application summary
    const studentData = JSON.parse(studentDetailsData);
    const emiData = JSON.parse(emiPlanData);
    const parentData = JSON.parse(parentPanData);
    const personalData = JSON.parse(personalDetailsData);

    const feeAmount = parseFloat(studentData.feeAmount || "0");
    const planMap: any = {
      "3-months": { duration: 3, emi: Math.ceil(feeAmount / 3), processingFee: feeAmount * 0.02 },
      "6-months": { duration: 6, emi: Math.ceil(feeAmount / 6), processingFee: feeAmount * 0.024 },
      "9-months": { duration: 9, emi: Math.ceil(feeAmount / 9), processingFee: feeAmount * 0.03 },
      "12-months": { duration: 12, emi: Math.ceil(feeAmount / 12), processingFee: feeAmount * 0.04 },
    };
    
    const selectedPlan = planMap[emiData.selectedPlanId];
    
    setApplicationSummary({
      student: {
        name: studentData.studentName,
        institution: studentData.institutionName,
        class: studentData.studentClass,
        feeAmount: feeAmount,
        feeType: studentData.feeType,
      },
      emi: {
        duration: selectedPlan.duration,
        monthlyAmount: selectedPlan.emi,
        processingFee: selectedPlan.processingFee,
        totalAmount: feeAmount + selectedPlan.processingFee,
      },
      parent: {
        name: parentData.parentName,
        pan: parentData.parentPan,
        phone: parentData.parentPhone,
        email: parentData.parentEmail,
        monthlyIncome: parentData.monthlyIncome,
      },
    });

    // Load saved consent data
    const savedData = localStorage.getItem('onboarding-terms-confirmation');
    if (savedData) {
      setFormData(JSON.parse(savedData));
    }
    
    setLoading(false);
  }, [router]);

  const handleConsentChange = (field: keyof ConfirmationData, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: checked
    }));
  };

  const saveProgress = () => {
    localStorage.setItem('onboarding-terms-confirmation', JSON.stringify(formData));
  };

  const validateForm = () => {
    const requiredConsents: (keyof ConfirmationData)[] = [
      "termsAccepted", "privacyAccepted", "creditCheckConsent"
    ];
    
    for (const consent of requiredConsents) {
      if (!formData[consent]) {
        toast({
          title: "Required consent missing",
          description: `Please accept all required terms and conditions to proceed`,
          variant: "destructive"
        });
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    saveProgress();
    setSubmitting(true);

    try {
      // Combine all form data
      const studentDetails = JSON.parse(localStorage.getItem('onboarding-student-details') || '{}');
      const emiPlan = JSON.parse(localStorage.getItem('onboarding-emi-plan') || '{}');
      const parentPan = JSON.parse(localStorage.getItem('onboarding-parent-pan') || '{}');
      const personalDetails = JSON.parse(localStorage.getItem('onboarding-personal-details') || '{}');
      
      const completeData = {
        ...studentDetails,
        ...emiPlan,
        ...parentPan,
        ...personalDetails,
        ...formData,
        applicationSummary,
        submittedAt: new Date().toISOString(),
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
        throw new Error(errorData.error || "Failed to submit application");
      }

      // Clear saved data
      localStorage.removeItem('onboarding-student-details');
      localStorage.removeItem('onboarding-emi-plan');
      localStorage.removeItem('onboarding-parent-pan');
      localStorage.removeItem('onboarding-personal-details');
      localStorage.removeItem('onboarding-terms-confirmation');

      toast({
        title: "🎉 Application Submitted Successfully!",
        description: "Your loan application has been submitted and is being processed.",
      });
      
      // Redirect to success/dashboard page
      router.push("/parent/dashboard?onboarding=completed");
    } catch (error) {
      console.error("Error submitting application:", error);
      toast({
        title: "Error submitting application",
        description: error instanceof Error ? error.message : "Failed to submit application. Please try again.",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleBack = () => {
    saveProgress();
    router.push("/parent/onboarding/steps/5");
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
          <p className="text-muted-foreground">Loading application summary...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="bg-green-50 px-8 py-6 border-b border-green-200">
          <div className="flex items-center mb-4">
            <div className="bg-green-600 text-white rounded-full w-10 h-10 flex items-center justify-center font-semibold mr-4">6</div>
            <h2 className="text-3xl font-bold text-gray-800">Final Confirmation</h2>
          </div>
          <p className="text-gray-600">Review your application details and confirm to proceed</p>
        </div>

        <div className="p-8">
          {/* Application Summary */}
          {applicationSummary && (
            <div className="mb-8">
              <h3 className="text-xl font-bold text-gray-800 mb-6">Application Summary</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {/* Student Details */}
                <Card className="border-2 border-blue-100">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center">
                      <FileText className="h-5 w-5 text-blue-600 mr-2" />
                      Student Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <div><strong>Name:</strong> {applicationSummary.student.name}</div>
                    <div><strong>Institution:</strong> {applicationSummary.student.institution}</div>
                    <div><strong>Class:</strong> {applicationSummary.student.class}</div>
                    <div><strong>Fee Type:</strong> {applicationSummary.student.feeType}</div>
                    <div><strong>Fee Amount:</strong> ₹{applicationSummary.student.feeAmount.toLocaleString('en-IN')}</div>
                  </CardContent>
                </Card>

                {/* EMI Plan */}
                <Card className="border-2 border-indigo-100">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center">
                      <CreditCard className="h-5 w-5 text-indigo-600 mr-2" />
                      EMI Plan
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <div><strong>Duration:</strong> {applicationSummary.emi.duration} months</div>
                    <div><strong>Monthly EMI:</strong> ₹{applicationSummary.emi.monthlyAmount.toLocaleString('en-IN')}</div>
                    <div><strong>Processing Fee:</strong> ₹{applicationSummary.emi.processingFee.toLocaleString('en-IN')}</div>
                    <div><strong>Interest Rate:</strong> 0% (Zero Interest)</div>
                    <div className="pt-2 border-t"><strong>Total Amount:</strong> ₹{applicationSummary.emi.totalAmount.toLocaleString('en-IN')}</div>
                  </CardContent>
                </Card>

                {/* Parent Details */}
                <Card className="border-2 border-purple-100">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center">
                      <Shield className="h-5 w-5 text-purple-600 mr-2" />
                      Parent Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <div><strong>Name:</strong> {applicationSummary.parent.name}</div>
                    <div><strong>PAN:</strong> {applicationSummary.parent.pan}</div>
                    <div><strong>Phone:</strong> {applicationSummary.parent.phone}</div>
                    <div><strong>Email:</strong> {applicationSummary.parent.email}</div>
                    <div><strong>Monthly Income:</strong> ₹{applicationSummary.parent.monthlyIncome}</div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* Terms and Conditions */}
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-gray-800">Terms & Conditions</h3>
            
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <Checkbox
                  id="termsAccepted"
                  checked={formData.termsAccepted}
                  onCheckedChange={(checked) => handleConsentChange("termsAccepted", checked as boolean)}
                  className="mt-1"
                />
                <label htmlFor="termsAccepted" className="text-sm text-gray-700 cursor-pointer">
                  I have read and agree to the <a href="#" className="text-blue-600 underline">Terms and Conditions</a> and <a href="#" className="text-blue-600 underline">Loan Agreement</a> *
                </label>
              </div>

              <div className="flex items-start space-x-3">
                <Checkbox
                  id="privacyAccepted"
                  checked={formData.privacyAccepted}
                  onCheckedChange={(checked) => handleConsentChange("privacyAccepted", checked as boolean)}
                  className="mt-1"
                />
                <label htmlFor="privacyAccepted" className="text-sm text-gray-700 cursor-pointer">
                  I accept the <a href="#" className="text-blue-600 underline">Privacy Policy</a> and consent to the collection and use of my personal information *
                </label>
              </div>

              <div className="flex items-start space-x-3">
                <Checkbox
                  id="creditCheckConsent"
                  checked={formData.creditCheckConsent}
                  onCheckedChange={(checked) => handleConsentChange("creditCheckConsent", checked as boolean)}
                  className="mt-1"
                />
                <label htmlFor="creditCheckConsent" className="text-sm text-gray-700 cursor-pointer">
                  I authorize MyFee and its lending partners to perform credit checks, verify my information with credit bureaus, and process this loan application *
                </label>
              </div>

              <div className="flex items-start space-x-3">
                <Checkbox
                  id="communicationConsent"
                  checked={formData.communicationConsent}
                  onCheckedChange={(checked) => handleConsentChange("communicationConsent", checked as boolean)}
                  className="mt-1"
                />
                <label htmlFor="communicationConsent" className="text-sm text-gray-700 cursor-pointer">
                  I agree to receive communications about my loan application, payment reminders, and promotional offers via SMS, email, and phone calls
                </label>
              </div>
            </div>
          </div>

          {/* Important Information */}
          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
            <div className="flex items-start">
              <CheckCircle className="w-6 h-6 text-blue-600 mt-1 mr-3 flex-shrink-0" />
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-2">What happens after you submit?</p>
                <ul className="list-disc list-inside space-y-1">
                  <li><strong>Instant Processing:</strong> Your application will be processed immediately</li>
                  <li><strong>Loan Approval:</strong> You'll receive approval notification within 5 minutes</li>
                  <li><strong>Fee Payment:</strong> We'll pay the institution directly within 24 hours</li>
                  <li><strong>EMI Schedule:</strong> Your EMI schedule will be sent to your registered email</li>
                  <li><strong>Account Access:</strong> Full dashboard access to track payments and documents</li>
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
              onClick={handleSubmit}
              disabled={submitting || !formData.termsAccepted || !formData.privacyAccepted || !formData.creditCheckConsent}
              className="bg-gradient-to-r from-green-600 to-teal-700 hover:from-green-700 hover:to-teal-800 px-8 py-3 text-lg font-semibold shadow-lg transform transition duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Submitting Application...
                </>
              ) : (
                <>
                  Submit Application
                  <CheckCircle className="ml-2 w-5 h-5" />
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}