"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import { ChevronDownIcon, CalendarIcon } from "lucide-react";
import { cn } from "~/lib/utils";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "~/components/ui/popover";
import { Calendar } from "~/components/ui/calendar";
import { useToast } from "~/hooks/use-toast";
import { Loader2 } from "lucide-react";

// Zod schema for validation
const personalDetailsSchema = z.object({
  applicantPan: z.string()
    .min(1, "PAN is required")
    .length(10, "PAN must be exactly 10 characters")
    .regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, "Invalid PAN format (e.g., ABCDE1234F)"),
  gender: z.string().min(1, "Gender is required"),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  maritalStatus: z.string().min(1, "Marital status is required"),
  email: z.string()
    .min(1, "Email is required")
    .email("Invalid email address"),
  alternatePhone: z.string()
    .optional()
    .refine((val) => !val || /^[6-9]\d{9}$/.test(val), "Invalid phone number"),
  fatherName: z.string()
    .min(1, "Father's name is required")
    .min(2, "Name must be at least 2 characters")
    .regex(/^[a-zA-Z\s]+$/, "Name should only contain letters"),
  motherName: z.string()
    .min(1, "Mother's name is required")
    .min(2, "Name must be at least 2 characters")
    .regex(/^[a-zA-Z\s]+$/, "Name should only contain letters"),
  spouseName: z.string().optional(),
  educationLevel: z.string().optional(),
  workExperience: z.string().optional(),
  companyType: z.string().optional(),
}).refine((data) => {
  // Spouse name is required if married
  if (data.maritalStatus === "Married" && !data.spouseName) {
    return false;
  }
  return true;
}, {
  message: "Spouse name is required when married",
  path: ["spouseName"],
});

type PersonalDetailsFormValues = z.infer<typeof personalDetailsSchema>;

export default function PersonalDetailsForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [dobPopoverOpen, setDobPopoverOpen] = useState(false);

  // Initialize form with react-hook-form
  const form = useForm<PersonalDetailsFormValues>({
    resolver: zodResolver(personalDetailsSchema),
    defaultValues: {
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
    },
    mode: "onChange",
  });

  const { formState: { isSubmitting, isValid } } = form;
  const maritalStatus = form.watch("maritalStatus");

  // Load saved data on mount
  useEffect(() => {
    // Pre-populate with data from previous steps
    const parentPanData = localStorage.getItem('onboarding-parent-pan');
    if (parentPanData) {
      try {
        const parentData = JSON.parse(parentPanData);
        if (parentData.parentPan) {
          form.setValue("applicantPan", parentData.parentPan);
        }
        if (parentData.parentEmail) {
          form.setValue("email", parentData.parentEmail);
        }
      } catch (error) {
        console.error("Error loading parent data:", error);
      }
    }

    // Load saved data
    const savedData = localStorage.getItem('onboarding-personal-details');
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
      localStorage.setItem('onboarding-personal-details', JSON.stringify(values));
    });
    return () => subscription.unsubscribe();
  }, [form]);

  const saveToDatabase = async (data: PersonalDetailsFormValues) => {
    try {
      const response = await fetch("/api/parent/apply/partial", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          step: 5,
          data: {
            applicantPan: data.applicantPan,
            gender: data.gender,
            dateOfBirth: data.dateOfBirth,
            maritalStatus: data.maritalStatus,
            email: data.email,
            alternatePhone: data.alternatePhone,
            fatherName: data.fatherName,
            motherName: data.motherName,
            spouseName: data.spouseName,
            educationLevel: data.educationLevel,
            workExperience: data.workExperience,
            companyType: data.companyType,
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

  const onSubmit = async (data: PersonalDetailsFormValues) => {
    // Save to localStorage
    localStorage.setItem('onboarding-personal-details', JSON.stringify(data));

    // Save to database
    const saved = await saveToDatabase(data);

    if (saved) {
      router.push("/parent/apply/steps/6");
    }
  };

  const handleBack = () => {
    const currentValues = form.getValues();
    localStorage.setItem('onboarding-personal-details', JSON.stringify(currentValues));
    router.push("/parent/apply/steps/4");
  };

  const handleSaveAndExit = () => {
    const currentValues = form.getValues();
    localStorage.setItem('onboarding-personal-details', JSON.stringify(currentValues));
    toast({
      title: "Progress saved",
      description: "Your progress has been saved. You can continue later from your dashboard."
    });
    router.push("/parent/dashboard");
  };

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

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Basic Information */}
                <div className="md:col-span-2">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Basic Information</h3>
                </div>

                <FormField
                  control={form.control}
                  name="applicantPan"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>PAN Card Number *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="ABCDE1234F"
                          maxLength={10}
                          className="h-12"
                          {...field}
                          onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                        />
                      </FormControl>
                      <FormDescription>
                        This is pre-filled from your parent PAN details
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="gender"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Gender *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="h-12">
                            <SelectValue placeholder="Select gender" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-white border border-gray-200 shadow-lg">
                          <SelectItem value="Male">Male</SelectItem>
                          <SelectItem value="Female">Female</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="dateOfBirth"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date of Birth *</FormLabel>
                      <Popover open={dobPopoverOpen} onOpenChange={setDobPopoverOpen}>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={cn(
                                "h-12 w-full justify-between font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                new Date(field.value).toLocaleDateString()
                              ) : (
                                "Select date of birth"
                              )}
                              <ChevronDownIcon className="h-4 w-4" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto overflow-hidden p-0 bg-white" align="start">
                          <Calendar
                            mode="single"
                            captionLayout="dropdown"
                            selected={field.value ? new Date(field.value) : undefined}
                            onSelect={(date) => {
                              if (date) {
                                field.onChange(format(date, "yyyy-MM-dd"));
                                setDobPopoverOpen(false);
                              }
                            }}
                            startMonth={new Date(new Date().getFullYear() - 100, 0, 1)}
                            endMonth={new Date(new Date().getFullYear() - 18, 11, 31)}
                            disabled={(date) => {
                              const today = new Date();
                              const eighteenYearsAgo = new Date();
                              eighteenYearsAgo.setFullYear(today.getFullYear() - 18);
                              const hundredYearsAgo = new Date();
                              hundredYearsAgo.setFullYear(today.getFullYear() - 100);
                              return date > eighteenYearsAgo || date < hundredYearsAgo;
                            }}
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="maritalStatus"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Marital Status *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="h-12">
                            <SelectValue placeholder="Select marital status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-white border border-gray-200 shadow-lg">
                          <SelectItem value="Single">Single</SelectItem>
                          <SelectItem value="Married">Married</SelectItem>
                          <SelectItem value="Divorced">Divorced</SelectItem>
                          <SelectItem value="Widowed">Widowed</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address *</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="your.email@example.com"
                          className="h-12"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="alternatePhone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Alternate Phone Number</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter 10-digit mobile number"
                          maxLength={10}
                          className="h-12"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Family Information */}
                <div className="md:col-span-2 mt-8">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Family Information</h3>
                </div>

                <FormField
                  control={form.control}
                  name="fatherName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Father's Full Name *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter father's full name"
                          className="h-12"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="motherName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mother's Full Name *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter mother's full name"
                          className="h-12"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {maritalStatus === "Married" && (
                  <FormField
                    control={form.control}
                    name="spouseName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Spouse's Full Name *</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter spouse's full name"
                            className="h-12"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                {/* Professional Information */}
                <div className="md:col-span-2 mt-8">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Professional Information (Optional)</h3>
                </div>

                <FormField
                  control={form.control}
                  name="educationLevel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Highest Education Level</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="h-12">
                            <SelectValue placeholder="Select education level" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-white border border-gray-200 shadow-lg">
                          <SelectItem value="High School">High School</SelectItem>
                          <SelectItem value="Diploma">Diploma</SelectItem>
                          <SelectItem value="Bachelor's Degree">Bachelor's Degree</SelectItem>
                          <SelectItem value="Master's Degree">Master's Degree</SelectItem>
                          <SelectItem value="PhD">PhD</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="workExperience"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Work Experience</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="h-12">
                            <SelectValue placeholder="Select work experience" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-white border border-gray-200 shadow-lg">
                          <SelectItem value="0-2 years">0-2 years</SelectItem>
                          <SelectItem value="2-5 years">2-5 years</SelectItem>
                          <SelectItem value="5-10 years">5-10 years</SelectItem>
                          <SelectItem value="10-15 years">10-15 years</SelectItem>
                          <SelectItem value="15+ years">15+ years</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="companyType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Company Type</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="h-12">
                            <SelectValue placeholder="Select company type" />
                          </SelectTrigger>
                        </FormControl>
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
                      <FormMessage />
                    </FormItem>
                  )}
                />
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
                      Final Step: Confirmation
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
    </div>
  );
}