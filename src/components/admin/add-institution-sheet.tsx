"use client";

import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "~/components/ui/sheet";
import { ScrollArea } from "~/components/ui/scroll-area";
import { Switch } from "~/components/ui/switch";
import { Save, Building, MapPin, GraduationCap, Plus } from "lucide-react";
import { useToast } from "~/hooks/use-toast";
import { useRouter } from "next/navigation";

interface InstitutionData {
  name: string;
  type: string;
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

  const resetForm = () => {
    setFormData({
      name: "",
      type: "",
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
    const requiredFields: (keyof InstitutionData)[] = [
      "name", "type", "city", "board"
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
        body: JSON.stringify(formData),
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

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">City *</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => handleInputChange("city", e.target.value)}
                    placeholder="City"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="state">State</Label>
                  <Input
                    id="state"
                    value={formData.state}
                    onChange={(e) => handleInputChange("state", e.target.value)}
                    placeholder="State"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Full Address</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => handleInputChange("address", e.target.value)}
                  placeholder="Complete address"
                />
              </div>
            </div>

            {/* Educational Information */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2 text-lg font-semibold text-gray-900">
                <GraduationCap className="h-5 w-5 text-blue-600" />
                <span>Educational Details</span>
              </div>

              <div className="space-y-2">
                <Label htmlFor="board">Board/Curriculum *</Label>
                <Select value={formData.board} onValueChange={(value) => handleInputChange("board", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select board or curriculum" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border border-gray-200 shadow-lg">
                    <SelectItem value="CBSE">CBSE</SelectItem>
                    <SelectItem value="ICSE">ICSE</SelectItem>
                    <SelectItem value="State Board">State Board</SelectItem>
                    <SelectItem value="IB">IB (International Baccalaureate)</SelectItem>
                    <SelectItem value="University">University</SelectItem>
                  </SelectContent>
                </Select>
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