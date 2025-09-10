"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { useToast } from "~/hooks/use-toast";
import { Loader2, Search, MapPin, BookOpen, Calendar, User, DollarSign } from "lucide-react";

interface StudentInstitutionData {
  institutionName: string;
  location: string;
  board: string;
  academicYear: string;
  studentFirstName: string;
  studentLastName: string;
  admissionType: string;
  classStream: string;
  studentId: string;
  annualFeeAmount: string;
}

export default function StudentInstitutionForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [formData, setFormData] = useState<StudentInstitutionData>({
    institutionName: "",
    location: "",
    board: "",
    academicYear: "",
    studentFirstName: "",
    studentLastName: "",
    admissionType: "",
    classStream: "",
    studentId: "",
    annualFeeAmount: "",
  });
  const [loading, setLoading] = useState(true);
  const [showStudentForm, setShowStudentForm] = useState(false);

  useEffect(() => {
    // Load saved data
    const savedData = localStorage.getItem('onboarding-student-institution');
    if (savedData) {
      const parsed = JSON.parse(savedData);
      setFormData(parsed);
      // Show student form if institution details are already filled
      if (parsed.institutionName && parsed.academicYear) {
        setShowStudentForm(true);
      }
    }
    setLoading(false);
  }, []);

  const handleInputChange = (field: keyof StudentInstitutionData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const saveProgress = () => {
    localStorage.setItem('onboarding-student-institution', JSON.stringify(formData));
  };

  const validateInstitutionForm = () => {
    const requiredFields: (keyof StudentInstitutionData)[] = [
      "institutionName", "academicYear"
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

  const handleShowStudentForm = () => {
    if (!validateInstitutionForm()) return;
    
    saveProgress();
    setShowStudentForm(true);
  };

  const validateForm = () => {
    const requiredFields: (keyof StudentInstitutionData)[] = [
      "institutionName", "studentFirstName", "studentLastName", 
      "admissionType", "classStream", "annualFeeAmount"
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

    const feeAmount = parseFloat(formData.annualFeeAmount);
    if (isNaN(feeAmount) || feeAmount <= 0) {
      toast({
        title: "Invalid fee amount",
        description: "Please enter a valid fee amount",
        variant: "destructive"
      });
      return false;
    }

    return true;
  };

  const handleShowPlans = () => {
    if (!validateForm()) return;
    
    saveProgress();
    router.push("/onboarding/parent/steps/2");
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
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="bg-blue-50 px-8 py-6 border-b border-blue-200">
        <div className="flex items-center mb-4">
          <div className="bg-blue-600 text-white rounded-full w-10 h-10 flex items-center justify-center font-semibold mr-4">1</div>
          <h2 className="text-3xl font-bold text-gray-800">Student & Institution Details</h2>
        </div>
        <p className="text-gray-600">Please provide your child's educational information</p>
      </div>

      <div className="p-8">
        <div className="space-y-8">
          {/* Institution Details */}
          <div className="space-y-6">
            <div className="flex items-center space-x-2 text-lg font-semibold text-gray-800">
              <Search className="h-5 w-5 text-blue-600" />
              <span>Where does the student study?</span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="institutionName">Search for School / College / University</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="institutionName"
                    value={formData.institutionName}
                    onChange={(e) => handleInputChange("institutionName", e.target.value)}
                    placeholder="Enter institution name"
                    className="pl-10 h-12"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Select Location</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => handleInputChange("location", e.target.value)}
                    placeholder="City, State"
                    className="pl-10 h-12"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="board">Select Board / Class / Stream</Label>
                <div className="relative">
                  <BookOpen className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <select
                    id="board"
                    value={formData.board}
                    onChange={(e) => handleInputChange("board", e.target.value)}
                    className="w-full h-12 pl-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  >
                    <option value="">Select Board</option>
                    <option value="CBSE">CBSE</option>
                    <option value="ICSE">ICSE</option>
                    <option value="State Board">State Board</option>
                    <option value="IB">IB</option>
                    <option value="University">University</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="academicYear">Academic Year</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <select
                    id="academicYear"
                    value={formData.academicYear}
                    onChange={(e) => handleInputChange("academicYear", e.target.value)}
                    className="w-full h-12 pl-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  >
                    <option value="">Select Academic Year</option>
                    <option value="2024-25">2024-25</option>
                    <option value="2025-26">2025-26</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <strong>NOTE:</strong> Select the academic year which you will be paying the fee for.
              </p>
            </div>

            {/* Show Student Form Button - Only show if student form is not visible */}
            {!showStudentForm && (
              <div className="pt-6 text-center">
                <Button
                  onClick={handleShowStudentForm}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg font-semibold"
                  size="lg"
                >
                  Next
                </Button>
              </div>
            )}
          </div>

          {/* Student Details - Only show when showStudentForm is true */}
          {showStudentForm && (
            <div className="space-y-6">
              <div className="flex items-center space-x-2 text-lg font-semibold text-gray-800">
                <User className="h-5 w-5 text-blue-600" />
                <span>What is the name of the Student?</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="studentFirstName">First Name</Label>
                  <Input
                    id="studentFirstName"
                    value={formData.studentFirstName}
                    onChange={(e) => handleInputChange("studentFirstName", e.target.value)}
                    placeholder="First Name"
                    className="h-12"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="studentLastName">Last Name</Label>
                  <Input
                    id="studentLastName"
                    value={formData.studentLastName}
                    onChange={(e) => handleInputChange("studentLastName", e.target.value)}
                    placeholder="Last Name"
                    className="h-12"
                  />
                </div>
              </div>

              {/* Admission Type */}
              <div className="space-y-4">
                <Label className="text-lg font-semibold text-gray-800">What is the Admission Type?</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div
                    onClick={() => handleInputChange("admissionType", "Existing Student")}
                    className={`border-2 rounded-lg p-4 cursor-pointer transition-colors ${
                      formData.admissionType === "Existing Student" 
                        ? "border-blue-500 bg-blue-50" 
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="text-center">
                      <div className="font-medium">Existing Student</div>
                    </div>
                  </div>

                  <div
                    onClick={() => handleInputChange("admissionType", "New Admission")}
                    className={`border-2 rounded-lg p-4 cursor-pointer transition-colors ${
                      formData.admissionType === "New Admission" 
                        ? "border-blue-500 bg-blue-50" 
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="text-center">
                      <div className="font-medium">New Admission</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Class and Student ID */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="classStream">Class</Label>
                  <Input
                    id="classStream"
                    value={formData.classStream}
                    onChange={(e) => handleInputChange("classStream", e.target.value)}
                    placeholder="e.g., Class 10, B.Tech 1st Year"
                    className="h-12"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="studentId">Student ID (Optional)</Label>
                  <Input
                    id="studentId"
                    value={formData.studentId}
                    onChange={(e) => handleInputChange("studentId", e.target.value)}
                    placeholder="Student ID (Optional)"
                    className="h-12"
                  />
                </div>
              </div>

              {/* Fee Amount */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2 text-lg font-semibold text-gray-800">
                  <DollarSign className="h-5 w-5 text-blue-600" />
                  <span>What is the Annual Fee Amount?</span>
                </div>

                <div className="max-w-md">
                  <Label htmlFor="annualFeeAmount">Enter Amount</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">₹</span>
                    <Input
                      id="annualFeeAmount"
                      type="number"
                      value={formData.annualFeeAmount}
                      onChange={(e) => handleInputChange("annualFeeAmount", e.target.value)}
                      placeholder="Enter Amount"
                      className="pl-8 h-12 text-lg"
                    />
                  </div>
                </div>
              </div>

              {/* Show Plans Button */}
              <div className="pt-6">
                <Button
                  onClick={handleShowPlans}
                  className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg font-semibold"
                  size="lg"
                >
                  Show Plans
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <div className="bg-gray-50 px-8 py-6 flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/dashboard/parent")}
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
        </div>
      </div>
    </div>
  );
}