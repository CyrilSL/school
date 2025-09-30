"use client";

import { useEffect, useState } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
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

// Zod schema for validation
const studentInstitutionSchema = z.object({
  institutionName: z.string().min(1, "Institution is required"),
  institutionId: z.string().min(1, "Please select a location"),
  location: z.string().min(1, "Location is required"),
  board: z.string().min(1, "Board is required"),
  academicYear: z.string().min(1, "Academic year is required"),
  studentFirstName: z.string()
    .min(1, "First name is required")
    .min(2, "First name must be at least 2 characters")
    .regex(/^[a-zA-Z\s]+$/, "Name should only contain letters"),
  studentLastName: z.string()
    .min(1, "Last name is required")
    .min(2, "Last name must be at least 2 characters")
    .regex(/^[a-zA-Z\s]+$/, "Name should only contain letters"),
  admissionType: z.string().min(1, "Admission type is required"),
  classStream: z.string().min(1, "Class is required"),
  studentId: z.string().optional(),
  annualFeeAmount: z.string()
    .min(1, "Fee amount is required")
    .refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, "Fee amount must be a positive number"),
});

type StudentInstitutionFormValues = z.infer<typeof studentInstitutionSchema>;

export default function StudentInstitutionForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [showStudentForm, setShowStudentForm] = useState(false);

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

  // Initialize form with react-hook-form
  const form = useForm<StudentInstitutionFormValues>({
    resolver: zodResolver(studentInstitutionSchema),
    defaultValues: {
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
    },
    mode: "onChange",
  });

  const { formState: { isSubmitting, isValid } } = form;

  // Watch for institution selection changes
  const institutionName = form.watch("institutionName");
  const location = form.watch("location");
  const academicYear = form.watch("academicYear");

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
      try {
        const parsed = JSON.parse(savedData);
        form.reset(parsed);
        setInstitutionSearch(parsed.institutionName || "");

        // If institution was selected, load its locations
        if (parsed.institutionName) {
          fetchInstitutionLocations(parsed.institutionName);
        }

        // Show student form if institution details are already filled
        if (parsed.institutionName && parsed.academicYear) {
          setShowStudentForm(true);
        }
      } catch (error) {
        console.error("Error loading saved data:", error);
      }
    }
    setLoading(false);
  }, [form, toast]);

  // Fetch locations and boards for selected institution
  const fetchInstitutionLocations = async (institutionName: string) => {
    try {
      const response = await fetch(`/api/institutions?institutionName=${encodeURIComponent(institutionName)}`);
      if (response.ok) {
        const data = await response.json();
        console.log('[FORM] Institution data received:', data);

        setInstitutionLocations(data.locations);
        setAvailableBoards(data.boards);

        // Auto-select if only one location exists
        if (data.locations && data.locations.length === 1) {
          const singleLocation = data.locations[0];
          console.log('[FORM] Auto-selecting single location:', singleLocation);

          form.setValue("institutionId", singleLocation.id);
          form.setValue("location", singleLocation.location);
        }

        // Auto-select board ONLY if exactly one board exists
        if (data.boards && data.boards.length === 1) {
          console.log('[FORM] Auto-selecting single board:', data.boards[0]);
          form.setValue("board", data.boards[0]);
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

  // Auto-expand student form when all institution details are filled
  useEffect(() => {
    const institutionComplete = institutionName && location && form.watch("board") && academicYear;
    if (institutionComplete && !showStudentForm) {
      setShowStudentForm(true);
    }
  }, [institutionName, location, form.watch("board"), academicYear, showStudentForm]);

  // Filter institutions based on search
  useEffect(() => {
    if (!institutionSearch) {
      setFilteredInstitutions(institutions);
      return;
    }

    const filtered = institutions.filter(institution =>
      institution.name.toLowerCase().includes(institutionSearch.toLowerCase()) ||
      institution.type.toLowerCase().includes(institutionSearch.toLowerCase()) ||
      (institution.cities && institution.cities.some(city => city.toLowerCase().includes(institutionSearch.toLowerCase()))) ||
      (institution.boards && institution.boards.some(board => board.toLowerCase().includes(institutionSearch.toLowerCase())))
    );
    setFilteredInstitutions(filtered);
  }, [institutionSearch, institutions]);

  // Auto-save to localStorage when form values change
  useEffect(() => {
    const subscription = form.watch((values) => {
      localStorage.setItem('onboarding-student-institution', JSON.stringify(values));
    });
    return () => subscription.unsubscribe();
  }, [form]);

  const handleInstitutionSelect = (institution: Institution) => {
    form.setValue("institutionName", institution.name);
    form.setValue("institutionId", "");
    form.setValue("location", "");
    form.setValue("board", "");

    setInstitutionSearch(institution.name);
    setInstitutionOpen(false);

    // Clear location and board data
    setInstitutionLocations([]);
    setAvailableBoards([]);

    // Fetch locations for this institution
    fetchInstitutionLocations(institution.name);
  };

  const handleLocationSelect = (location: InstitutionLocation) => {
    form.setValue("institutionId", location.id);
    form.setValue("location", location.location);
    // Only set board if there's exactly one available board
    if (availableBoards.length === 1) {
      form.setValue("board", availableBoards[0]);
    }
    setLocationOpen(false);
  };

  const handleBoardSelect = (board: string) => {
    form.setValue("board", board);
    setBoardOpen(false);
  };

  const saveToDatabase = async (data: StudentInstitutionFormValues) => {
    try {
      const response = await fetch("/api/parent/apply/partial", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          step: 1,
          data: {
            institutionId: data.institutionId,
            institutionName: data.institutionName,
            location: data.location,
            board: data.board,
            academicYear: data.academicYear,
            studentFirstName: data.studentFirstName,
            studentLastName: data.studentLastName,
            admissionType: data.admissionType,
            classStream: data.classStream,
            studentId: data.studentId,
            annualFeeAmount: data.annualFeeAmount,
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

  const onSubmit = async (data: StudentInstitutionFormValues) => {
    // Save to localStorage
    localStorage.setItem('onboarding-student-institution', JSON.stringify(data));

    // Save to database
    const saved = await saveToDatabase(data);

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

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="p-8">
            <div className="space-y-8">
              {/* Institution Details */}
              <div className="space-y-6">
                <div className="flex items-center space-x-2 text-lg font-semibold text-gray-800">
                  <Search className="h-5 w-5 text-blue-600" />
                  <span>Where does the student study?</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="institutionName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Search for School / College / University</FormLabel>
                        <Popover open={institutionOpen} onOpenChange={setInstitutionOpen}>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                role="combobox"
                                aria-expanded={institutionOpen}
                                className="h-12 w-full justify-between pl-10 text-left font-normal"
                              >
                                <Search className="absolute left-3 h-4 w-4 text-gray-400" />
                                {field.value || "Select institution..."}
                                <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-[--radix-popover-trigger-width] p-0 bg-white border border-gray-200 shadow-lg" align="start">
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
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Select Location</FormLabel>
                        {institutionLocations.length === 1 ? (
                          <div className="h-12 w-full border border-gray-200 rounded-md flex items-center pl-10 bg-gray-50">
                            <MapPin className="absolute left-3 h-4 w-4 text-gray-400" />
                            <div className="font-medium text-gray-900">{field.value}</div>
                          </div>
                        ) : (
                          <Popover open={locationOpen} onOpenChange={setLocationOpen}>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant="outline"
                                  role="combobox"
                                  aria-expanded={locationOpen}
                                  disabled={!institutionName || institutionLocations.length === 0}
                                  className="h-12 w-full justify-between pl-10 text-left font-normal disabled:opacity-50"
                                >
                                  <MapPin className="absolute left-3 h-4 w-4 text-gray-400" />
                                  {field.value || "Select location..."}
                                  <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-[--radix-popover-trigger-width] p-0 bg-white border border-gray-200 shadow-lg" align="start">
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
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="board"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Select Board / Stream</FormLabel>
                        {availableBoards.length === 1 ? (
                          <div className="h-12 w-full border border-gray-200 rounded-md flex items-center pl-10 bg-gray-50">
                            <BookOpen className="absolute left-3 h-4 w-4 text-gray-400" />
                            <div className="font-medium text-gray-900">{field.value}</div>
                          </div>
                        ) : (
                          <Popover open={boardOpen} onOpenChange={setBoardOpen}>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant="outline"
                                  role="combobox"
                                  aria-expanded={boardOpen}
                                  disabled={!location || availableBoards.length === 0}
                                  className="h-12 w-full justify-between pl-10 text-left font-normal disabled:opacity-50"
                                >
                                  <BookOpen className="absolute left-3 h-4 w-4 text-gray-400" />
                                  {field.value || "Select board..."}
                                  <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-[--radix-popover-trigger-width] p-0 bg-white border border-gray-200 shadow-lg" align="start">
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
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="academicYear"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Academic Year</FormLabel>
                        <div className="relative">
                          <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 z-10" />
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger className="h-12 pl-10">
                                <SelectValue placeholder="Select Academic Year" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="bg-white">
                              <SelectItem value="2024-25">2024-25</SelectItem>
                              <SelectItem value="2025-26">2025-26</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
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
                    <FormField
                      control={form.control}
                      name="studentFirstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>First Name</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="First Name"
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
                      name="studentLastName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Last Name</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Last Name"
                              className="h-12"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Admission Type */}
                  <FormField
                    control={form.control}
                    name="admissionType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-lg font-semibold text-gray-800">What is the Admission Type?</FormLabel>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div
                            onClick={() => field.onChange("Existing Student")}
                            className={`border-2 rounded-lg p-4 cursor-pointer transition-colors ${
                              field.value === "Existing Student"
                                ? "border-blue-500 bg-blue-50"
                                : "border-gray-200 hover:border-gray-300"
                            }`}
                          >
                            <div className="text-center">
                              <div className="font-medium">Existing Student</div>
                            </div>
                          </div>

                          <div
                            onClick={() => field.onChange("New Admission")}
                            className={`border-2 rounded-lg p-4 cursor-pointer transition-colors ${
                              field.value === "New Admission"
                                ? "border-blue-500 bg-blue-50"
                                : "border-gray-200 hover:border-gray-300"
                            }`}
                          >
                            <div className="text-center">
                              <div className="font-medium">New Admission</div>
                            </div>
                          </div>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Class and Student ID */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="classStream"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Class</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="e.g., Class 10, B.Tech 1st Year"
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
                      name="studentId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Student ID (Optional)</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Student ID (Optional)"
                              className="h-12"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Fee Amount */}
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2 text-lg font-semibold text-gray-800">
                      <DollarSign className="h-5 w-5 text-blue-600" />
                      <span>What is the Annual Fee Amount?</span>
                    </div>

                    <div className="max-w-md">
                      <FormField
                        control={form.control}
                        name="annualFeeAmount"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Enter Amount</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">₹</span>
                                <Input
                                  type="number"
                                  placeholder="Enter Amount"
                                  className="pl-8 h-12 text-lg"
                                  {...field}
                                />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
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
                    Next
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