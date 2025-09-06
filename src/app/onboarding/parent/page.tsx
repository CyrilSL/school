"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "~/server/auth/client";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";

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
  studentClass: string;
  studentSection: string;
  institutionName: string;
}

export default function ParentOnboarding() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
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
    studentClass: "",
    studentSection: "",
    institutionName: "",
  });

  useEffect(() => {
    authClient.getSession().then((session) => {
      if (!session?.user) {
        router.push("/login/parent");
        return;
      }
      
      setUser(session.user);
      setLoading(false);
    });
  }, [router]);

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

  if (loading) return <div>Loading...</div>;

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle>Parent Onboarding</CardTitle>
          <CardDescription>
            Please provide the following information to complete your profile and add your student details.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Parent Information */}
            <div>
              <h3 className="text-lg font-medium mb-4">Parent Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              <div className="space-y-2 mt-4">
                <Label htmlFor="address">Address *</Label>
                <textarea
                  id="address"
                  value={formData.address}
                  onChange={(e) => handleInputChange("address", e.target.value)}
                  placeholder="Enter complete address"
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  rows={3}
                />
              </div>
            </div>

            {/* Optional Information */}
            <div>
              <h3 className="text-lg font-medium mb-4">Additional Information (Optional)</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    placeholder="Enter annual income"
                  />
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
            <div>
              <h3 className="text-lg font-medium mb-4">Student Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="studentName">Student Name *</Label>
                  <Input
                    id="studentName"
                    value={formData.studentName}
                    onChange={(e) => handleInputChange("studentName", e.target.value)}
                    placeholder="Enter student's full name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="institutionName">Institution Name *</Label>
                  <Input
                    id="institutionName"
                    value={formData.institutionName}
                    onChange={(e) => handleInputChange("institutionName", e.target.value)}
                    placeholder="Enter school/college name"
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
              </div>
            </div>

            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/login/parent")}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? "Saving..." : "Complete Onboarding"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}