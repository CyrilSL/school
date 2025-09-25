"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { useToast } from "~/hooks/use-toast";
import { Loader2, Shield, Clock, CreditCard, Users, Award, CheckCircle } from "lucide-react";

export default function OnboardingIntroForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [studentName, setStudentName] = useState("");
  const [selectedPlan, setSelectedPlan] = useState<any>(null);

  useEffect(() => {
    // Try to load data for display, but don't redirect if missing
    try {
      const studentDetailsData = localStorage.getItem('onboarding-student-details') || localStorage.getItem('onboarding-student-institution');
      const emiPlanData = localStorage.getItem('onboarding-emi-plan');
      
      if (studentDetailsData && emiPlanData) {
        const studentData = JSON.parse(studentDetailsData);
        const emiData = JSON.parse(emiPlanData);
        
        setStudentName(studentData.studentName || studentData.studentFirstName || "your child");
        
        // Get selected EMI plan details
        const feeAmount = parseFloat(studentData.feeAmount || studentData.annualFeeAmount || "0");
        const planId = emiData.selectedPlanId;
        const planMap: any = {
          "plan-a": { duration: 9, emi: Math.ceil(feeAmount / 9) },
          "plan-b": { duration: 6, emi: Math.ceil(feeAmount / 6) },
          "plan-c": { duration: 3, emi: Math.ceil(feeAmount / 3) },
          "plan-d": { duration: 12, emi: Math.ceil(feeAmount / 12) },
          "plan-e": { duration: 18, emi: Math.ceil(feeAmount / 18) },
        };
        
        setSelectedPlan(planMap[planId] || { duration: 6, emi: Math.ceil(feeAmount / 6) });
      }
    } catch (error) {
      console.log("Could not load onboarding data for display:", error);
    }
    
    setLoading(false);
  }, []);

  const handleNext = () => {
    router.push("/parent/apply/steps/5");
  };

  const handleBack = () => {
    router.push("/parent/apply/steps/3");
  };

  const handleSaveAndExit = () => {
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

  const trustFeatures = [
    {
      icon: Shield,
      title: "100% Secure & Regulated",
      description: "RBI-compliant lending partner with bank-level security protocols"
    },
    {
      icon: Clock,
      title: "Instant Approvals",
      description: "Get approved in under 5 minutes with our AI-powered assessment"
    },
    {
      icon: CreditCard,
      title: "Zero Hidden Charges",
      description: "Transparent pricing with no processing fees or pre-payment penalties"
    },
    {
      icon: Users,
      title: "50,000+ Happy Parents",
      description: "Trusted by parents across India for their children's education"
    },
    {
      icon: Award,
      title: "Award-Winning Service",
      description: "Winner of 'Best EdTech Finance Solution 2024' award"
    }
  ];

  return (
    <div className="max-w-6xl mx-auto">
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        {/* Hero Section */}
        <div className="bg-blue-600 text-white px-8 py-12">
          <div className="text-center max-w-4xl mx-auto">
            <h2 className="text-4xl font-bold mb-4">
              You're Just 2 Steps Away from Securing {studentName}'s Future! 🎓
            </h2>
            <p className="text-xl text-blue-100 mb-6">
              Join thousands of parents who trust MyFee for hassle-free education financing
            </p>
            {selectedPlan && (
              <div className="bg-white/10 rounded-lg p-4 inline-block">
                <p className="text-lg">
                  Your selected plan: <span className="font-bold">₹{selectedPlan.emi.toLocaleString('en-IN')}/month</span> for {selectedPlan.duration} months
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Trust Features */}
        <div className="p-8">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">Why Parents Trust MyFee</h3>
            <p className="text-gray-600">We understand the importance of your child's education. Here's why we're the right choice:</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {trustFeatures.map((feature, index) => (
              <Card key={index} className="border-2 border-gray-100 hover:border-blue-200 transition-colors">
                <CardHeader className="text-center pb-2">
                  <feature.icon className="h-12 w-12 text-blue-600 mx-auto mb-2" />
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-center">{feature.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Process Overview */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8">
            <h4 className="text-xl font-bold text-green-800 mb-4 text-center">What happens next?</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start">
                <CheckCircle className="h-5 w-5 text-green-600 mr-3 mt-1 flex-shrink-0" />
                <div>
                  <p className="font-medium text-green-800">Step 5: Personal Details</p>
                  <p className="text-sm text-green-700">Complete your KYC information (2 minutes)</p>
                </div>
              </div>
              <div className="flex items-start">
                <CheckCircle className="h-5 w-5 text-green-600 mr-3 mt-1 flex-shrink-0" />
                <div>
                  <p className="font-medium text-green-800">Step 6: Final Confirmation</p>
                  <p className="text-sm text-green-700">Review terms & complete your application</p>
                </div>
              </div>
              <div className="flex items-start">
                <CheckCircle className="h-5 w-5 text-green-600 mr-3 mt-1 flex-shrink-0" />
                <div>
                  <p className="font-medium text-green-800">Instant Approval</p>
                  <p className="text-sm text-green-700">Get approval notification immediately</p>
                </div>
              </div>
              <div className="flex items-start">
                <CheckCircle className="h-5 w-5 text-green-600 mr-3 mt-1 flex-shrink-0" />
                <div>
                  <p className="font-medium text-green-800">Fee Payment</p>
                  <p className="text-sm text-green-700">We pay the institution directly</p>
                </div>
              </div>
            </div>
          </div>

          {/* Testimonial */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <img
                  className="h-12 w-12 rounded-full"
                  src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face"
                  alt="Parent testimonial"
                />
              </div>
              <div className="ml-4">
                <p className="text-blue-800 italic">
                  "MyFee made it so easy to manage my daughter's college fees. The zero-interest EMI plan was exactly what we needed. Highly recommended!"
                </p>
                <p className="text-blue-700 font-medium mt-2">- Rajesh Kumar, Parent from Delhi</p>
                <div className="flex mt-1">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="h-4 w-4 text-yellow-400 fill-current" viewBox="0 0 20 20">
                      <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                    </svg>
                  ))}
                </div>
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
              className="bg-blue-600 hover:bg-blue-700 px-8 py-3 text-lg font-semibold shadow-lg transform transition duration-200 hover:scale-105 text-white"
            >
              Continue to Loan Application
              <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
