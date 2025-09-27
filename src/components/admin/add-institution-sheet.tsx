"use client";

import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "~/components/ui/sheet";
import { ScrollArea } from "~/components/ui/scroll-area";
import { Switch } from "~/components/ui/switch";
import { TagInput } from "~/components/ui/tag-input";
import { LocationTagInput } from "~/components/ui/location-tag-input";
import AddLocationLite from "./add-location-lite";
import { Save, Building, MapPin, GraduationCap, Plus } from "lucide-react";
import { useToast } from "~/hooks/use-toast";
import { useRouter } from "next/navigation";

interface InstitutionData {
  name: string;
  type: string;
  locations: string[]; // e.g., ["Mumbai, Maharashtra", "Delhi, Delhi"]
  boards: string[]; // e.g., ["CBSE", "ICSE"]
  // Legacy fields for single location/board
  city: string;
  state: string;
  board: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  isActive: boolean;
}

export default function AddInstitutionSheet() {
  const { toast } = useToast();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<InstitutionData>({
    name: "",
    type: "",
    locations: [],
    boards: [],
    // Legacy fields
    city: "",
    state: "",
    board: "",
    address: "",
    phone: "",
    email: "",
    website: "",
    isActive: true,
  });

  const handleInputChange = (field: keyof InstitutionData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSwitchChange = (field: keyof InstitutionData, value: boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleArrayChange = (field: keyof InstitutionData, value: string[]) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleLocationAdded = (displayName: string) => {
    // Add the new location to the current locations list
    if (!formData.locations.includes(displayName)) {
      setFormData(prev => ({
        ...prev,
        locations: [...prev.locations, displayName]
      }));
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      type: "",
      locations: [],
      boards: [],
      city: "",
      state: "",
      board: "",
      address: "",
      phone: "",
      email: "",
      website: "",
      isActive: true,
    });
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      toast({
        title: "Missing required field",
        description: "Please enter an institution name",
        variant: "destructive"
      });
      return false;
    }

    if (!formData.type.trim()) {
      toast({
        title: "Missing required field",
        description: "Please select an institution type",
        variant: "destructive"
      });
      return false;
    }

    if (formData.locations.length === 0) {
      toast({
        title: "Missing required field",
        description: "Please add at least one location",
        variant: "destructive"
      });
      return false;
    }

    if (formData.boards.length === 0) {
      toast({
        title: "Missing required field",
        description: "Please add at least one board/curriculum",
        variant: "destructive"
      });
      return false;
    }

    if (formData.email && !formData.email.includes('@')) {
      toast({
        title: "Invalid email",
        description: "Please enter a valid email address",
        variant: "destructive"
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);

    try {
      const response = await fetch("/api/admin/institutions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          type: formData.type,
          locations: formData.locations.map(locationString => {
            const parts = locationString.split(', ');
            return {
              city: parts[0],
              state: parts[1] || undefined,
              address: undefined
            };
          }),
          boards: formData.boards,
          phone: formData.phone,
          email: formData.email,
          website: formData.website,
          isActive: formData.isActive,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create institution");
      }

      toast({
        title: "Institution created successfully",
        description: `${formData.name} has been added to the system`,
      });

      resetForm();
      setOpen(false);
      router.refresh(); // Refresh the page to show new institution
    } catch (error) {
      console.error("Error creating institution:", error);
      toast({
        title: "Error creating institution",
        description: error instanceof Error ? error.message : "Failed to create institution",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button className="bg-blue-600 hover:bg-blue-700 text-white">
          <Plus className="h-4 w-4 mr-2" />
          Add Institution
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[600px] sm:max-w-[600px] bg-white">
        <SheetHeader>
          <SheetTitle className="flex items-center space-x-2">
            <Building className="h-5 w-5 text-blue-600" />
            <span>Add New Institution</span>
          </SheetTitle>
          <SheetDescription>
            Create a new educational institution that parents can apply to
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-120px)] mt-6">
          <form onSubmit={handleSubmit} className="space-y-6 pr-4">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3>

              <div className="space-y-2">
                <Label htmlFor="name">Institution Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  placeholder="Institution name"
                  className="placeholder:text-gray-400"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Type *</Label>
                <Select value={formData.type} onValueChange={(value) => handleInputChange("type", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select institution type" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border border-gray-200 shadow-lg">
                    <SelectItem value="school">School</SelectItem>
                    <SelectItem value="college">College</SelectItem>
                    <SelectItem value="university">University</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Location Information */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2 text-lg font-semibold text-gray-900">
                <MapPin className="h-5 w-5 text-blue-600" />
                <span>Location</span>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="locations">Locations *</Label>
                  <AddLocationLite onLocationAdded={handleLocationAdded} />
                </div>
                <LocationTagInput
                  tags={formData.locations}
                  onTagsChange={(locations) => handleArrayChange("locations", locations)}
                  placeholder="Add locations (e.g., Mumbai, Maharashtra)"
                />
                <p className="text-sm text-gray-500">
                  Add multiple locations where this institution has campuses. Can't find your city? Use the "Add Location" button above.
                </p>
              </div>
            </div>

            {/* Educational Information */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2 text-lg font-semibold text-gray-900">
                <GraduationCap className="h-5 w-5 text-blue-600" />
                <span>Educational Details</span>
              </div>

              <div className="space-y-2">
                <Label htmlFor="boards">Boards/Curriculum *</Label>
                <TagInput
                  tags={formData.boards}
                  onTagsChange={(boards) => handleArrayChange("boards", boards)}
                  placeholder="Add boards/curriculum (e.g., CBSE, ICSE)"
                  className="placeholder:text-gray-400"
                  suggestions={[
                    "CBSE",
                    "ICSE",
                    "State Board",
                    "IB (International Baccalaureate)",
                    "University",
                    "Cambridge International",
                    "NIOS",
                    "Montessori"
                  ]}
                />
                <p className="text-sm text-gray-500">
                  Add all boards/curriculum offered by this institution
                </p>
              </div>
            </div>

            {/* Contact Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Contact Information</h3>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    placeholder="Phone number"
                    className="placeholder:text-gray-400"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    placeholder="Email address"
                    className="placeholder:text-gray-400"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  value={formData.website}
                  onChange={(e) => handleInputChange("website", e.target.value)}
                  placeholder="Website URL"
                  className="placeholder:text-gray-400"
                />
              </div>
            </div>

            {/* Status */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Status</h3>

              <div className="flex items-center space-x-3">
                <Switch
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => handleSwitchChange("isActive", checked)}
                />
                <Label htmlFor="isActive" className="text-sm font-medium">
                  Enable Institution
                </Label>
              </div>
              <p className="text-sm text-gray-500">
                Disabled institutions will not be available for parent applications
              </p>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-4 pt-6 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Creating...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Create Institution
                  </>
                )}
              </Button>
            </div>
          </form>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}