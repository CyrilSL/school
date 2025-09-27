"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { useToast } from "~/hooks/use-toast";
import { Loader2, Search, MapPin, BookOpen, Calendar, User, DollarSign, ChevronDown } from "lucide-react";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "~/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "~/components/ui/popover";

interface Institution {
  name: string;
  type: string;
  campusCount: number;
  cities: string[];
  boards: string[];
}

interface InstitutionLocation {
  id: string;
  city: string;
  state: string | null;
  location: string;
  board: string | null;
  type: string;
}

interface StudentInstitutionData {
  institutionName: string;
  institutionId: string;
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
    institutionId: "",
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
  const [isFormValid, setIsFormValid] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Institution cascading data
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [institutionLocations, setInstitutionLocations] = useState<InstitutionLocation[]>([]);
  const [availableBoards, setAvailableBoards] = useState<string[]>([]);

  // UI states
  const [institutionSearch, setInstitutionSearch] = useState("");
  const [institutionOpen, setInstitutionOpen] = useState(false);
  const [locationOpen, setLocationOpen] = useState(false);
  const [boardOpen, setBoardOpen] = useState(false);
  const [filteredInstitutions, setFilteredInstitutions] = useState<Institution[]>([]);

  // Fetch institutions on component mount
  useEffect(() => {
    const fetchInstitutions = async () => {
      try {
        const response = await fetch('/api/institutions');
        if (response.ok) {
          const data = await response.json();
          setInstitutions(data.institutions);
          setFilteredInstitutions(data.institutions);
        }
      } catch (error) {
        console.error('Error fetching institutions:', error);
        toast({
          title: "Error",
          description: "Failed to load institutions. Please refresh the page.",
          variant: "destructive"
        });
      }
    };

    fetchInstitutions();

    // Load saved data
    const savedData = localStorage.getItem('onboarding-student-institution');
    if (savedData) {
      const parsed = JSON.parse(savedData);
      setFormData(parsed);
      setInstitutionSearch(parsed.institutionName || "");

      // If institution was selected, load its locations
      if (parsed.institutionName) {
        fetchInstitutionLocations(parsed.institutionName);
      }

      // Show student form if institution details are already filled
      if (parsed.institutionName && parsed.academicYear) {
        setShowStudentForm(true);
      }
      // Validate immediately after loading data
      setTimeout(() => {
        setIsFormValid(validateForm());
      }, 0);
    }
    setLoading(false);
  }, []);

  // Fetch locations and boards for selected institution
  const fetchInstitutionLocations = async (institutionName: string) => {
    try {
      const response = await fetch(`/api/institutions?institutionName=${encodeURIComponent(institutionName)}`);
      if (response.ok) {
        const data = await response.json();
        console.log('[FORM] Institution data received:', data);
        console.log('[FORM] Locations array:', data.locations);
        console.log('[FORM] Boards array:', data.boards);

        setInstitutionLocations(data.locations);
        setAvailableBoards(data.boards);

        // Auto-select if only one location exists
        if (data.locations && data.locations.length === 1) {
          const singleLocation = data.locations[0];
          console.log('[FORM] Auto-selecting single location:', singleLocation);
          console.log('[FORM] Location string from singleLocation.location:', singleLocation.location);

          setFormData(prev => {
            const newFormData = {
              ...prev,
              institutionId: singleLocation.id,
              location: singleLocation.location,
              // Don't auto-set board from location - let the board logic handle it
            };
            console.log('[FORM] Updated form data after location selection:', newFormData);
            return newFormData;
          });
        } else {
          console.log(`[FORM] Not auto-selecting location. Locations length: ${data.locations?.length || 0}`);
        }

        // Auto-select board ONLY if exactly one board exists
        if (data.boards && data.boards.length === 1) {
          console.log('[FORM] Auto-selecting single board:', data.boards[0]);
          setFormData(prev => {
            const newFormData = {
              ...prev,
              board: data.boards[0],
            };
            console.log('[FORM] Updated form data after board selection:', newFormData);
            return newFormData;
          });
        } else {
          console.log(`[FORM] Not auto-selecting board. Boards length: ${data.boards?.length || 0}`);
        }
      }
    } catch (error) {
      console.error('Error fetching institution locations:', error);
      toast({
        title: "Error",
        description: "Failed to load institution locations.",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    setIsFormValid(validateForm());

    // Auto-expand student form when all institution details are filled
    const institutionComplete = formData.institutionName &&
                               formData.location &&
                               formData.board &&
                               formData.academicYear;

    if (institutionComplete && !showStudentForm) {
      setShowStudentForm(true);
    }
  }, [formData, showStudentForm]);

  // Filter institutions based on search
  useEffect(() => {
    if (!institutionSearch) {
      setFilteredInstitutions(institutions);
      return;
    }

    const filtered = institutions.filter(institution =>
      institution.name.toLowerCase().includes(institutionSearch.toLowerCase()) ||
      institution.city.toLowerCase().includes(institutionSearch.toLowerCase()) ||
      (institution.board && institution.board.toLowerCase().includes(institutionSearch.toLowerCase()))
    );
    setFilteredInstitutions(filtered);
  }, [institutionSearch, institutions]);

  const handleInputChange = (field: keyof StudentInstitutionData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleInstitutionSelect = (institution: Institution) => {
    setFormData(prev => ({
      ...prev,
      institutionName: institution.name,
      institutionId: "", // Reset since location not selected yet
      location: "", // Reset location
      board: "", // Reset board
    }));
    setInstitutionSearch(institution.name);
    setInstitutionOpen(false);

    // Clear location and board data
    setInstitutionLocations([]);
    setAvailableBoards([]);

    // Fetch locations for this institution
    fetchInstitutionLocations(institution.name);
  };

  const handleLocationSelect = (location: InstitutionLocation) => {
    setFormData(prev => ({
      ...prev,
      institutionId: location.id,
      location: location.location,
      // Only set board if there's exactly one available board
      board: availableBoards.length === 1 ? availableBoards[0] : "",
    }));
    setLocationOpen(false);
  };

  const handleBoardSelect = (board: string) => {
    setFormData(prev => ({
      ...prev,
      board: board,
    }));
    setBoardOpen(false);
  };

  const saveProgress = () => {
    localStorage.setItem('onboarding-student-institution', JSON.stringify(formData));
  };

  const validateInstitutionForm = () => {
    if (!formData.institutionName.trim()) {
      toast({
        title: "Missing required field",
        description: "Please select an institution",
        variant: "destructive"
      });
      return false;
    }

    if (!formData.location.trim()) {
      toast({
        title: "Missing required field",
        description: "Please select a location",
        variant: "destructive"
      });
      return false;
    }

    if (!formData.board.trim()) {
      toast({
        title: "Missing required field",
        description: "Please select a board",
        variant: "destructive"
      });
      return false;
    }

    if (!formData.academicYear.trim()) {
      toast({
        title: "Missing required field",
        description: "Please select an academic year",
        variant: "destructive"
      });
      return false;
    }

    return true;
  };

  const handleShowStudentForm = () => {
    if (!validateInstitutionForm()) return;
    
    saveProgress();
    setShowStudentForm(true);
  };

  const validateForm = () => {
    // Check institution selection
    if (!formData.institutionId || !formData.institutionName.trim()) {
      return false;
    }

    // Check other required fields
    const requiredFields: (keyof StudentInstitutionData)[] = [
      "academicYear", "studentFirstName", "studentLastName",
      "admissionType", "classStream", "annualFeeAmount"
    ];

    for (const field of requiredFields) {
      const value = formData[field].trim();
      if (!value) {
        return false;
      }
    }

    const feeAmount = parseFloat(formData.annualFeeAmount);
    if (isNaN(feeAmount) || feeAmount <= 0) {
      return false;
    }

    return true;
  };

  const saveToDatabase = async () => {
    try {
      const response = await fetch("/api/parent/apply/partial", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          step: 1,
          data: {
            institutionId: formData.institutionId,
            institutionName: formData.institutionName,
            location: formData.location,
            board: formData.board,
            academicYear: formData.academicYear,
            studentFirstName: formData.studentFirstName,
            studentLastName: formData.studentLastName,
            admissionType: formData.admissionType,
            classStream: formData.classStream,
            studentId: formData.studentId,
            annualFeeAmount: formData.annualFeeAmount,
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

  const handleShowPlans = async () => {
    if (!validateForm()) return;

    setIsSaving(true);

    // Save to localStorage (keep existing functionality)
    saveProgress();

    // Save to database
    const saved = await saveToDatabase();

    setIsSaving(false);

    if (saved) {
      router.push("/parent/apply/steps/2");
    }
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
                <Label>Search for School / College / University</Label>
                <Popover open={institutionOpen} onOpenChange={setInstitutionOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={institutionOpen}
                      className="h-12 w-full justify-between pl-10 text-left font-normal"
                    >
                      <Search className="absolute left-3 h-4 w-4 text-gray-400" />
                      {formData.institutionName || "Select institution..."}
                      <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0 bg-white border border-gray-200 shadow-lg">
                    <Command className="bg-white">
                      <CommandInput
                        placeholder="Search institutions..."
                        value={institutionSearch}
                        onValueChange={setInstitutionSearch}
                        className="bg-white"
                      />
                      <CommandList className="bg-white">
                        <CommandEmpty className="bg-white">No institutions found.</CommandEmpty>
                        <CommandGroup className="bg-white">
                          {filteredInstitutions.map((institution) => (
                            <CommandItem
                              key={institution.name}
                              value={institution.name}
                              onSelect={() => handleInstitutionSelect(institution)}
                              className="bg-white hover:bg-gray-50"
                            >
                              <div className="flex flex-col">
                                <div className="font-medium">{institution.name}</div>
                                <div className="text-sm text-gray-500">
                                  {institution.type}
                                </div>
                              </div>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label>Select Location</Label>
                {(() => {
                  console.log('[RENDER] institutionLocations.length:', institutionLocations.length);
                  console.log('[RENDER] institutionLocations:', institutionLocations);
                  console.log('[RENDER] formData.location:', formData.location);
                  return null;
                })()}
                {institutionLocations.length === 1 ? (
                  <div className="h-12 w-full border border-gray-200 rounded-md flex items-center pl-10 bg-gray-50">
                    <MapPin className="absolute left-3 h-4 w-4 text-gray-400" />
                    <div className="flex flex-col">
                      <div className="font-medium text-gray-900">{formData.location}</div>
                    </div>
                  </div>
                ) : (
                  <Popover open={locationOpen} onOpenChange={setLocationOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={locationOpen}
                        disabled={!formData.institutionName || institutionLocations.length === 0}
                        className="h-12 w-full justify-between pl-10 text-left font-normal disabled:opacity-50"
                      >
                        <MapPin className="absolute left-3 h-4 w-4 text-gray-400" />
                        {formData.location || "Select location..."}
                        <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0 bg-white border border-gray-200 shadow-lg">
                      <Command className="bg-white">
                        <CommandInput placeholder="Search locations..." className="bg-white" />
                        <CommandList className="bg-white">
                          <CommandEmpty className="bg-white">No locations found.</CommandEmpty>
                          <CommandGroup className="bg-white">
                            {institutionLocations.map((location) => (
                              <CommandItem
                                key={location.id}
                                value={location.location}
                                onSelect={() => handleLocationSelect(location)}
                                className="bg-white hover:bg-gray-50"
                              >
                                <div className="font-medium">{location.location}</div>
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                )}
              </div>

              <div className="space-y-2">
                <Label>Select Board / Stream</Label>
                {availableBoards.length === 1 ? (
                  <div className="h-12 w-full border border-gray-200 rounded-md flex items-center pl-10 bg-gray-50">
                    <BookOpen className="absolute left-3 h-4 w-4 text-gray-400" />
                    <div className="flex flex-col">
                      <div className="font-medium text-gray-900">{formData.board}</div>
                    </div>
                  </div>
                ) : (
                  <Popover open={boardOpen} onOpenChange={setBoardOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={boardOpen}
                        disabled={!formData.location || availableBoards.length === 0}
                        className="h-12 w-full justify-between pl-10 text-left font-normal disabled:opacity-50"
                      >
                        <BookOpen className="absolute left-3 h-4 w-4 text-gray-400" />
                        {formData.board || "Select board..."}
                        <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0 bg-white border border-gray-200 shadow-lg">
                      <Command className="bg-white">
                        <CommandList className="bg-white">
                          <CommandEmpty className="bg-white">No boards found.</CommandEmpty>
                          <CommandGroup className="bg-white">
                            {availableBoards.map((board) => (
                              <CommandItem
                                key={board}
                                value={board}
                                onSelect={() => handleBoardSelect(board)}
                                className="bg-white hover:bg-gray-50"
                              >
                                <div className="font-medium">{board}</div>
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="academicYear">Academic Year</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 z-10" />
                  <Select value={formData.academicYear} onValueChange={(value) => handleInputChange("academicYear", value)}>
                    <SelectTrigger className="h-12 pl-10">
                      <SelectValue placeholder="Select Academic Year" />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      <SelectItem value="2024-25">2024-25</SelectItem>
                      <SelectItem value="2025-26">2025-26</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <strong>NOTE:</strong> Select the academic year which you will be paying the fee for.
              </p>
            </div>

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
            onClick={() => router.push("/login/parent")}
          >
            Cancel
          </Button>
        <Button
          type="button"
          onClick={handleShowPlans}
          disabled={!isFormValid || isSaving}
          className="bg-blue-600 hover:bg-blue-700 px-8 disabled:opacity-50 disabled:cursor-not-allowed text-white"
        >
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                Next
                <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
