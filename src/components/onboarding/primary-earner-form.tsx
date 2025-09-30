"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
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
import { Loader2, Info, ArrowLeft } from "lucide-react";

// Define Zod schema for validation
const primaryEarnerSchema = z.object({
  firstName: z.string()
    .min(1, "First name is required")
    .min(2, "First name must be at least 2 characters")
    .max(50, "First name must not exceed 50 characters")
    .regex(/^[a-zA-Z\s]+$/, "First name should only contain letters"),
  lastName: z.string()
    .min(1, "Last name is required")
    .min(2, "Last name must be at least 2 characters")
    .max(50, "Last name must not exceed 50 characters")
    .regex(/^[a-zA-Z\s]+$/, "Last name should only contain letters"),
});

type PrimaryEarnerFormValues = z.infer<typeof primaryEarnerSchema>;

export default function PrimaryEarnerForm() {
  const router = useRouter();
  const { toast } = useToast();

  // Initialize form with react-hook-form
  const form = useForm<PrimaryEarnerFormValues>({
    resolver: zodResolver(primaryEarnerSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
    },
    mode: "onChange", // Validate on change for better UX
  });

  const { formState: { isSubmitting, isValid } } = form;

  // Load saved data from localStorage on mount
  useEffect(() => {
    const savedData = localStorage.getItem('onboarding-primary-earner');
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
      localStorage.setItem('onboarding-primary-earner', JSON.stringify(values));
    });
    return () => subscription.unsubscribe();
  }, [form]);

  const saveToDatabase = async (data: PrimaryEarnerFormValues) => {
    try {
      const response = await fetch("/api/parent/apply/partial", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          step: 3,
          data: {
            fullName: `${data.firstName} ${data.lastName}`,
            firstName: data.firstName,
            lastName: data.lastName,
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

  const onSubmit = async (data: PrimaryEarnerFormValues) => {
    // Save to localStorage
    localStorage.setItem('onboarding-primary-earner', JSON.stringify(data));

    // Save to database
    const saved = await saveToDatabase(data);

    if (saved) {
      // Navigate to next step
      router.push("/parent/apply/steps/4");
    }
  };

  const handleBack = () => {
    // Save current form state before going back
    const currentValues = form.getValues();
    localStorage.setItem('onboarding-primary-earner', JSON.stringify(currentValues));
    router.push("/parent/apply/steps/2");
  };

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="bg-purple-50 px-8 py-6 border-b border-purple-200">
        <div className="flex items-center mb-4">
          <div className="bg-purple-600 text-white rounded-full w-10 h-10 flex items-center justify-center font-semibold mr-4">3</div>
          <h2 className="text-3xl font-bold text-gray-800">What is your Name?</h2>
        </div>
        <p className="text-gray-600">Primary earning member information for EMI registration</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="p-8">
            <div className="space-y-8">
              {/* Info Box */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <Info className="h-5 w-5 text-blue-600 mt-1 flex-shrink-0" />
                  <div className="text-sm text-blue-800">
                    <p className="font-medium">Important Information</p>
                    <p className="mt-1">
                      To register for EMI plan, we require you to enter details of the
                      <strong> primary earning member</strong> of the family only (usually a parent)
                    </p>
                  </div>
                </div>
              </div>

              {/* Form Fields */}
              <div className="space-y-6">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base font-medium">
                        First Name (as per PAN Card)
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="First Name (as per PAN Card)"
                          className="h-12 text-lg"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base font-medium">
                        Last Name (as per PAN Card)
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Last Name (as per PAN Card)"
                          className="h-12 text-lg"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Credit Score Disclaimer */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="text-sm text-green-800">
                  <p>
                    <strong>Privacy Notice:</strong> By proceeding, you allow affiliated banking partners
                    to fetch details from our partner bureau. Your credit score will
                    <strong> not be impacted</strong> by this.
                  </p>
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
                onClick={() => router.push("/parent/dashboard")}
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
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back</span>
              </Button>

              <Button
                type="submit"
                disabled={!isValid || isSubmitting}
                className="bg-blue-600 hover:bg-blue-700 px-8 disabled:opacity-50 disabled:cursor-not-allowed text-white"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    Next: Welcome
                    <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </>
                )}
              </Button>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}