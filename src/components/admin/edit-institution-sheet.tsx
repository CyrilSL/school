"use client";

import { useState, useEffect } from "react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "~/components/ui/sheet";
import { ScrollArea } from "~/components/ui/scroll-area";
import { Switch } from "~/components/ui/switch";
import { TagInput } from "~/components/ui/tag-input";
import { LocationTagInput } from "~/components/ui/location-tag-input";
import AddLocationLite from "./add-location-lite";
import { Save, Building, MapPin, GraduationCap } from "lucide-react";
import { useToast } from "~/hooks/use-toast";
import { useRouter } from "next/navigation";

interface Institution {
  id: string;
  name: string;
  type: string;
  // Legacy fields
  city: string;
  state: string | null;
  board: string | null;
  // New multi-select fields
  locations?: Array<{city: string; state?: string; address?: string}> | string[];
  boards?: string[];
  address: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date | null;
  organizationId: string;
}

interface InstitutionData {
  name: string;
  type: string;
  locations: string[]; // e.g., ["Mumbai, Maharashtra", "Delhi, Delhi"]
  boards: string[]; // e.g., ["CBSE", "ICSE"]
  // Legacy fields for backward compatibility
  city: string;
  state: string;
  board: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  isActive: boolean;
  // Login credentials
  adminEmail: string;
  adminPassword: string;
  adminName: string;
}

interface EditInstitutionSheetProps {
  institution: Institution | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function EditInstitutionSheet({ institution, open, onOpenChange }: EditInstitutionSheetProps) {
  const { toast } = useToast();

  const handleVerifyEmail = async (email: string) => {
    if (!email || !email.includes('@')) {
      toast({
        title: "Invalid email",
        description: "Please enter a valid email address first",
        variant: "destructive"
      });
      return;
    }

    setVerifyingEmail(email);
    try {
      const response = await fetch("/api/auth/verify-demo", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        setVerificationStatus(prev => ({ ...prev, [email]: true }));
        toast({
          title: "Email verified",
          description: `${email} has been verified successfully`,
        });
      } else {
        throw new Error("Verification failed");
      }
    } catch (error) {
      toast({
        title: "Verification failed",
        description: "Failed to verify email. Please try again.",
        variant: "destructive"
      });
    } finally {
      setVerifyingEmail(null);
    }
  };
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<{ [email: string]: boolean }>({});
  const [verifyingEmail, setVerifyingEmail] = useState<string | null>(null);
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
    // Login credentials
    adminEmail: "",
    adminPassword: "",
    adminName: "",
  });

  useEffect(() => {
    if (institution) {
      // Handle both old and new data formats
      let locations: string[] = [];
      let boards: string[] = [];

      // Check if institution has new format data
      if (institution.locations && Array.isArray(institution.locations)) {
        if (typeof institution.locations[0] === 'string') {
          // Already in string format
          locations = institution.locations as string[];
        } else {
          // Convert from object format to string format
          locations = (institution.locations as Array<{city: string; state?: string}>).map(
            (loc) => `${loc.city}${loc.state ? ', ' + loc.state : ''}`
          );
        }
      } else if (institution.city) {
        // Fallback to legacy format
        locations = [`${institution.city}${institution.state ? ', ' + institution.state : ''}`];
      }

      if (institution.boards && Array.isArray(institution.boards)) {
        boards = institution.boards;
      } else if (institution.board) {
        // Fallback to legacy format
        boards = [institution.board];
      }

      setFormData({
        name: institution.name,
        type: institution.type,
        locations: locations,
        boards: boards,
        // Legacy fields
        city: institution.city,
        state: institution.state || "",
        board: institution.board || "",
        address: institution.address || "",
        phone: institution.phone || "",
        email: institution.email || "",
        website: institution.website || "",
        isActive: institution.isActive,
        // Login credentials - leave empty for edit mode
        adminEmail: "",
        adminPassword: "",
        adminName: "",
      });
    }
  }, [institution]);

  const handleInputChange = (field: keyof InstitutionData, value: string) => {
    setFormData(prev => {
      const updated = {
        ...prev,
        [field]: value
      };

      // Auto-fill admin name when institution name changes (if admin name is empty)
      if (field === 'name' && !prev.adminName.trim()) {
        updated.adminName = value;
      }

      return updated;
    });
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

    // Validate admin credentials only if provided
    if (formData.adminEmail && !formData.adminEmail.includes('@')) {
      toast({
        title: "Invalid admin email",
        description: "Please enter a valid admin email address",
        variant: "destructive"
      });
      return false;
    }

    if (formData.adminPassword && formData.adminPassword.length < 6) {
      toast({
        title: "Password too short",
        description: "Password must be at least 6 characters long",
        variant: "destructive"
      });
      return false;
    }

    // If any admin field is filled, require all admin fields
    if (formData.adminEmail || formData.adminPassword || formData.adminName) {
      if (!formData.adminEmail.trim()) {
        toast({
          title: "Missing admin email",
          description: "Please enter admin email",
          variant: "destructive"
        });
        return false;
      }
      if (!formData.adminPassword.trim()) {
        toast({
          title: "Missing admin password",
          description: "Please enter admin password",
          variant: "destructive"
        });
        return false;
      }
      if (!formData.adminName.trim()) {
        toast({
          title: "Missing admin name",
          description: "Please enter admin name",
          variant: "destructive"
        });
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!institution || !validateForm()) return;

    setLoading(true);

    try {
      const response = await fetch(`/api/admin/institutions/${institution.id}`, {
        method: "PUT",
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
          // Include admin credentials only if provided
          ...(formData.adminEmail && {
            adminEmail: formData.adminEmail,
            adminPassword: formData.adminPassword,
            adminName: formData.adminName,
          }),
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update institution");
      }

      toast({
        title: "Institution updated successfully",
        description: `${formData.name} has been updated`,
      });

      onOpenChange(false);
      router.refresh();
    } catch (error) {
      console.error("Error updating institution:", error);
      toast({
        title: "Error updating institution",
        description: error instanceof Error ? error.message : "Failed to update institution",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (!institution) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-[600px] sm:max-w-[600px] bg-white">
        <SheetHeader>
          <SheetTitle className="flex items-center space-x-2">
            <Building className="h-5 w-5 text-blue-600" />
            <span>Edit Institution</span>
          </SheetTitle>
          <SheetDescription>
            Update the information for {institution.name}
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

            {/* Login Credentials */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Login Credentials</h3>
              <p className="text-sm text-gray-600">Update admin login credentials (leave blank to keep existing)</p>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="adminName">Admin Name</Label>
                  <Input
                    id="adminName"
                    value={formData.adminName}
                    onChange={(e) => handleInputChange("adminName", e.target.value)}
                    placeholder="Full name of admin"
                    className="placeholder:text-gray-400"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="adminEmail">Admin Email</Label>
                  <Input
                    id="adminEmail"
                    type="email"
                    value={formData.adminEmail}
                    onChange={(e) => handleInputChange("adminEmail", e.target.value)}
                    placeholder="admin@institution.edu"
                    className="placeholder:text-gray-400"
                  />
                  <div className="flex items-center justify-between mt-2">
                    <p className="text-sm text-gray-500">
                      This email will be used to log into the institution dashboard
                    </p>
                    {formData.adminEmail && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleVerifyEmail(formData.adminEmail)}
                        disabled={verifyingEmail === formData.adminEmail || verificationStatus[formData.adminEmail]}
                        className="ml-2"
                      >
                        {verifyingEmail === formData.adminEmail ? (
                          <>
                            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600 mr-1"></div>
                            Verifying...
                          </>
                        ) : verificationStatus[formData.adminEmail] ? (
                          <>
                            <svg className="w-3 h-3 text-green-600 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            Verified
                          </>
                        ) : (
                          "Verify Email"
                        )}
                      </Button>
                    )}
                  </div>
                  {verificationStatus[formData.adminEmail] && (
                    <p className="text-sm text-green-600 mt-1">
                      ✓ Email verified - admin can log in immediately
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="adminPassword">New Password</Label>
                  <Input
                    id="adminPassword"
                    type="password"
                    value={formData.adminPassword}
                    onChange={(e) => handleInputChange("adminPassword", e.target.value)}
                    placeholder="Enter new password"
                    className="placeholder:text-gray-400"
                  />
                  <p className="text-sm text-gray-500">
                    Minimum 6 characters. Leave blank to keep existing password.
                  </p>
                </div>
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
                  <Label htmlFor="email">General Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    placeholder="info@institution.edu"
                    className="placeholder:text-gray-400"
                  />
                  <p className="text-sm text-gray-500">
                    Public contact email (optional)
                  </p>
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
                onClick={() => onOpenChange(false)}
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
                    Updating...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Update Institution
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