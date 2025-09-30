"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Checkbox } from "~/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { useToast } from "~/hooks/use-toast";
import { Loader2, CheckCircle, FileText, Shield, CreditCard } from "lucide-react";

// Zod schema for validation
const termsConfirmationSchema = z.object({
  termsAccepted: z.boolean().refine((val) => val === true, {
    message: "You must accept the terms and conditions",
  }),
  privacyAccepted: z.boolean().refine((val) => val === true, {
    message: "You must accept the privacy policy",
  }),
  creditCheckConsent: z.boolean().refine((val) => val === true, {
    message: "Credit check consent is required",
  }),
  communicationConsent: z.boolean().optional(),
});

type TermsConfirmationFormValues = z.infer<typeof termsConfirmationSchema>;

export default function TermsConfirmationForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [applicationSummary, setApplicationSummary] = useState<any>(null);

  // Initialize form with react-hook-form
  const form = useForm<TermsConfirmationFormValues>({
    resolver: zodResolver(termsConfirmationSchema),
    defaultValues: {
      termsAccepted: false,
      privacyAccepted: false,
      creditCheckConsent: false,
      communicationConsent: false,
    },
    mode: "onChange",
  });

  const { formState: { isSubmitting, isValid } } = form;

  useEffect(() => {
    // Collect data from both legacy and new flows
    const studentDetailsData = localStorage.getItem('onboarding-student-details');
    const studentInstitutionData = localStorage.getItem('onboarding-student-institution');
    const emiPlanData = localStorage.getItem('onboarding-emi-plan');
    const parentPanData = localStorage.getItem('onboarding-parent-pan');
    const primaryEarnerData = localStorage.getItem('onboarding-primary-earner');
    const personalDetailsData = localStorage.getItem('onboarding-personal-details');

    // Build application summary (best-effort)
    try {
      const studentDetails = studentDetailsData ? JSON.parse(studentDetailsData) : {};
      const studentInstitution = studentInstitutionData ? JSON.parse(studentInstitutionData) : {};
      const emiData = emiPlanData ? JSON.parse(emiPlanData) : {};
      const parentData = parentPanData ? JSON.parse(parentPanData) : {};
      const primaryEarner = primaryEarnerData ? JSON.parse(primaryEarnerData) : {};
      const personalData = personalDetailsData ? JSON.parse(personalDetailsData) : {};

      const name = studentDetails.studentName || [studentInstitution.studentFirstName, studentInstitution.studentLastName].filter(Boolean).join(' ');
      const institution = studentDetails.institutionName || studentInstitution.institutionName;
      const studentClass = studentDetails.studentClass || studentInstitution.classStream;
      const feeAmountRaw = studentDetails.feeAmount || studentInstitution.annualFeeAmount || '0';
      const feeAmount = parseFloat(feeAmountRaw || '0');

      const normalizePlan = (id: string) => {
        switch (id) {
          case 'plan-a': return { duration: 9 };
          case 'plan-b': return { duration: 6 };
          case 'plan-c': return { duration: 12 };
          case 'plan-d': return { duration: 18 };
          case 'plan-e': return { duration: 24 };
          case '3-months': return { duration: 3 };
          case '6-months': return { duration: 6 };
          case '9-months': return { duration: 9 };
          case '12-months': return { duration: 12 };
          default: return { duration: 6 };
        }
      };
      const sel = normalizePlan(emiData?.selectedPlanId);
      const processingFee = feeAmount * 0.02 * (sel.duration / 3);

      setApplicationSummary({
        student: {
          name,
          institution,
          class: studentClass,
          feeAmount: feeAmount,
          feeType: studentDetails.feeType || 'Annual Fee',
        },
        emi: {
          duration: sel.duration,
          monthlyAmount: Math.ceil(feeAmount / sel.duration || 1),
          processingFee: processingFee,
          totalAmount: feeAmount + processingFee,
        },
        parent: {
          name: parentData.parentName || [primaryEarner.firstName, primaryEarner.lastName].filter(Boolean).join(' '),
          pan: parentData.parentPan || personalData.applicantPan,
          phone: parentData.parentPhone || personalData.alternatePhone,
          email: parentData.parentEmail || personalData.email,
          monthlyIncome: parentData.monthlyIncome,
        },
      });
    } catch (e) {
      console.warn('Failed building application summary:', e);
    }

    // Load saved consent data
    const savedData = localStorage.getItem('onboarding-terms-confirmation');
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        form.reset(parsed);
      } catch (error) {
        console.error("Error loading saved data:", error);
      }
    }
  }, [form]);

  // Auto-save to localStorage when form values change
  useEffect(() => {
    const subscription = form.watch((values) => {
      localStorage.setItem('onboarding-terms-confirmation', JSON.stringify(values));
    });
    return () => subscription.unsubscribe();
  }, [form]);

  const onSubmit = async (data: TermsConfirmationFormValues) => {
    try {
      // Collect all local sources
      const studentDetails = JSON.parse(localStorage.getItem('onboarding-student-details') || '{}');
      const studentInstitution = JSON.parse(localStorage.getItem('onboarding-student-institution') || '{}');
      const emiPlan = JSON.parse(localStorage.getItem('onboarding-emi-plan') || '{}');
      const parentPan = JSON.parse(localStorage.getItem('onboarding-parent-pan') || '{}');
      const primaryEarner = JSON.parse(localStorage.getItem('onboarding-primary-earner') || '{}');
      const personalDetails = JSON.parse(localStorage.getItem('onboarding-personal-details') || '{}');

      // Build API payload to satisfy server required fields
      const studentName = studentDetails.studentName || [studentInstitution.studentFirstName, studentInstitution.studentLastName].filter(Boolean).join(' ');
      const feeAmount = studentDetails.feeAmount || studentInstitution.annualFeeAmount;
      const payload = {
        // Step 1
        studentName,
        studentRollNumber: studentDetails.studentRollNumber || studentInstitution.studentId,
        studentDateOfBirth: studentDetails.studentDateOfBirth,
        studentClass: studentDetails.studentClass || studentInstitution.classStream,
        studentSection: studentDetails.studentSection,
        institutionName: studentDetails.institutionName || studentInstitution.institutionName,
        institutionAddress: studentDetails.institutionAddress || studentInstitution.location,
        previousSchool: studentDetails.previousSchool,
        feeAmount,
        feeType: studentDetails.feeType || 'Annual Fee',

        // Step 2
        selectedPlanId: emiPlan.selectedPlanId,

        // Step 3 legacy/new mapping
        parentName: parentPan.parentName || [primaryEarner.firstName, primaryEarner.lastName].filter(Boolean).join(' '),
        parentPan: parentPan.parentPan || personalDetails.applicantPan,
        parentPhone: parentPan.parentPhone || personalDetails.alternatePhone,
        parentEmail: parentPan.parentEmail || personalDetails.email,
        parentAddress: parentPan.parentAddress,
        relationToStudent: parentPan.relationToStudent || 'Parent',
        monthlyIncome: parentPan.monthlyIncome,
        occupation: parentPan.occupation,
        employer: parentPan.employer,

        // Step 5 personal details
        applicantPan: personalDetails.applicantPan || parentPan.parentPan,
        gender: personalDetails.gender,
        dateOfBirth: personalDetails.dateOfBirth,
        maritalStatus: personalDetails.maritalStatus,
        email: personalDetails.email,
        alternatePhone: personalDetails.alternatePhone,
        fatherName: personalDetails.fatherName,
        motherName: personalDetails.motherName,
        spouseName: personalDetails.spouseName,
        educationLevel: personalDetails.educationLevel,
        workExperience: personalDetails.workExperience,
        companyType: personalDetails.companyType,

        // Step 6 consents
        ...data,

        applicationSummary,
        submittedAt: new Date().toISOString(),
      };

      // Client-side guard for missing critical fields
      const missing: string[] = [];
      if (!payload.studentName) missing.push('Student Details (name)');
      if (!payload.institutionName) missing.push('Student Details (institution)');
      if (!payload.feeAmount) missing.push('Student Details (fee amount)');
      if (!payload.selectedPlanId) missing.push('EMI Plan');
      if (!payload.parentPan || !payload.parentName) missing.push('Parent PAN details');
      if (!payload.applicantPan) missing.push('Personal Details (PAN)');

      if (missing.length) {
        console.warn('[onboarding] Missing fields before submit:', missing);
        toast({
          title: 'Missing information',
          description: `Please complete: ${missing.join(', ')}`,
          variant: 'destructive',
        });
        if (missing[0].startsWith('Student Details')) router.push('/parent/apply/steps/1');
        else if (missing[0] === 'EMI Plan') router.push('/parent/apply/steps/2');
        else if (missing[0].startsWith('Parent PAN')) router.push('/parent/apply/steps/3');
        else if (missing[0].startsWith('Personal Details')) router.push('/parent/apply/steps/5');
        return;
      }

      console.log('[onboarding] Submitting payload', payload);

      // Step 1: Submit application
      const response = await fetch("/api/parent/apply", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('[onboarding] Server error response:', errorData);
        throw new Error(errorData.error || "Failed to submit application");
      }

      const applicationData = await response.json();
      const feeApplicationId = applicationData.applicationId || applicationData.id;

      // Step 2: Initiate payment
      toast({
        title: "Processing payment...",
        description: "Please wait while we process your payment.",
      });

      const paymentResponse = await fetch("/api/parent/payment/initiate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ feeApplicationId }),
      });

      if (!paymentResponse.ok) {
        const errorData = await paymentResponse.json();
        console.error('[payment] Server error response:', errorData);
        throw new Error(errorData.error || "Failed to process payment");
      }

      const paymentData = await paymentResponse.json();

      // Clear saved data
      localStorage.removeItem('onboarding-student-details');
      localStorage.removeItem('onboarding-student-institution');
      localStorage.removeItem('onboarding-emi-plan');
      localStorage.removeItem('onboarding-parent-pan');
      localStorage.removeItem('onboarding-primary-earner');
      localStorage.removeItem('onboarding-personal-details');
      localStorage.removeItem('onboarding-terms-confirmation');

      toast({
        title: "🎉 Payment Successful!",
        description: `Application submitted and payment processed. Transaction ID: ${paymentData.data.transactionId}`,
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
    }
  };

  const handleBack = () => {
    const currentValues = form.getValues();
    localStorage.setItem('onboarding-terms-confirmation', JSON.stringify(currentValues));
    router.push("/parent/apply/steps/5");
  };

  const handleSaveAndExit = () => {
    const currentValues = form.getValues();
    localStorage.setItem('onboarding-terms-confirmation', JSON.stringify(currentValues));
    toast({
      title: "Progress saved",
      description: "Your progress has been saved. You can continue later from your dashboard."
    });
    router.push("/parent/dashboard");
  };

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

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
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
                        {applicationSummary.parent.monthlyIncome && (
                          <div><strong>Monthly Income:</strong> ₹{applicationSummary.parent.monthlyIncome}</div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}

              {/* Terms and Conditions */}
              <div className="space-y-6">
                <h3 className="text-xl font-bold text-gray-800">Terms & Conditions</h3>

                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="termsAccepted"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel className="text-sm font-normal cursor-pointer">
                            I have read and agree to the <a href="#" className="text-blue-600 underline">Terms and Conditions</a> and <a href="#" className="text-blue-600 underline">Loan Agreement</a> *
                          </FormLabel>
                          <FormMessage />
                        </div>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="privacyAccepted"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel className="text-sm font-normal cursor-pointer">
                            I accept the <a href="#" className="text-blue-600 underline">Privacy Policy</a> and consent to the collection and use of my personal information *
                          </FormLabel>
                          <FormMessage />
                        </div>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="creditCheckConsent"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel className="text-sm font-normal cursor-pointer">
                            I authorize MyFee and its lending partners to perform credit checks, verify my information with credit bureaus, and process this loan application *
                          </FormLabel>
                          <FormMessage />
                        </div>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="communicationConsent"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel className="text-sm font-normal cursor-pointer">
                            I agree to receive communications about my loan application, payment reminders, and promotional offers via SMS, email, and phone calls
                          </FormLabel>
                        </div>
                      </FormItem>
                    )}
                  />
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
                  type="submit"
                  disabled={!isValid || isSubmitting}
                  className="bg-gradient-to-r from-green-600 to-teal-700 hover:from-green-700 hover:to-teal-800 px-8 py-3 text-lg font-semibold shadow-lg transform transition duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 text-white"
                >
                  {isSubmitting ? (
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
          </form>
        </Form>
      </div>
    </div>
  );
}