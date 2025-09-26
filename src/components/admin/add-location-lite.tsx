"use client";

import { useState, useEffect } from "react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "~/components/ui/dialog";
import { Badge } from "~/components/ui/badge";
import { Plus, MapPin, AlertTriangle, CheckCircle } from "lucide-react";
import { useToast } from "~/hooks/use-toast";
import { INDIAN_STATES, getStatesGrouped } from "~/lib/indian-states";

interface AddLocationLiteProps {
  onLocationAdded?: (displayName: string) => void;
  trigger?: React.ReactNode;
}

export default function AddLocationLite({ onLocationAdded, trigger }: AddLocationLiteProps) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    city: "",
    state: ""
  });
  const [checkingDuplicate, setCheckingDuplicate] = useState(false);
  const [existingLocation, setExistingLocation] = useState<{
    id: string;
    displayName: string;
    usageCount: number;
  } | null>(null);

  const { states, unionTerritories } = getStatesGrouped();

  // Check for duplicates when city or state changes
  useEffect(() => {
    const checkDuplicate = async () => {
      if (!formData.city.trim() || !formData.state) {
        setExistingLocation(null);
        return;
      }

      const displayName = `${formData.city.trim()}, ${formData.state}`;
      setCheckingDuplicate(true);

      try {
        const response = await fetch(`/api/locations?search=${encodeURIComponent(displayName)}`);
        if (response.ok) {
          const data = await response.json();
          const exactMatch = data.locations?.find((loc: any) =>
            loc.displayName.toLowerCase() === displayName.toLowerCase()
          );
          setExistingLocation(exactMatch || null);
        }
      } catch (error) {
        console.error('Error checking for duplicate:', error);
      } finally {
        setCheckingDuplicate(false);
      }
    };

    // Debounce the duplicate check
    const timeout = setTimeout(checkDuplicate, 300);
    return () => clearTimeout(timeout);
  }, [formData.city, formData.state]);

  const resetForm = () => {
    setFormData({ city: "", state: "" });
    setExistingLocation(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.city.trim() || !formData.state) {
      toast({
        title: "Missing fields",
        description: "Please enter both city and state",
        variant: "destructive"
      });
      return;
    }

    const displayName = `${formData.city.trim()}, ${formData.state}`;

    // If location already exists, just add it to the form without creating a new one
    if (existingLocation) {
      toast({
        title: "Location already exists",
        description: `${displayName} was added to your institution (${existingLocation.usageCount} other uses)`,
      });

      // Callback to parent component
      if (onLocationAdded) {
        onLocationAdded(displayName);
      }

      resetForm();
      setOpen(false);
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/locations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ displayName }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to add location');
      }

      const data = await response.json();

      toast({
        title: "New location created!",
        description: `${displayName} has been added to available locations`,
      });

      // Callback to parent component
      if (onLocationAdded) {
        onLocationAdded(displayName);
      }

      resetForm();
      setOpen(false);

    } catch (error) {
      console.error('Error adding location:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add location",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const defaultTrigger = (
    <Button
      type="button"
      variant="outline"
      size="sm"
      className="text-blue-600 border-blue-200 hover:bg-blue-50"
    >
      <Plus className="h-4 w-4 mr-1" />
      Add Location
    </Button>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>

      <DialogContent className="sm:max-w-[425px] bg-white">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <MapPin className="h-5 w-5 text-blue-600" />
            <span>Add New Location</span>
          </DialogTitle>
          <DialogDescription>
            Quickly add a new city/location to use in this institution
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="city">City Name *</Label>
            <Input
              id="city"
              value={formData.city}
              onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
              placeholder="Enter city name (e.g., Nashik)"
              className="placeholder:text-gray-400"
              autoFocus
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="state">State/Union Territory *</Label>
            <Select
              value={formData.state}
              onValueChange={(value) => setFormData(prev => ({ ...prev, state: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select state or union territory" />
              </SelectTrigger>
              <SelectContent className="bg-white border border-gray-200 shadow-lg max-h-48">
                {/* States */}
                <div className="px-2 py-1 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  States
                </div>
                {states.map((state) => (
                  <SelectItem key={state.code} value={state.name}>
                    {state.name}
                  </SelectItem>
                ))}

                {/* Union Territories */}
                <div className="px-2 py-1 text-xs font-semibold text-gray-500 uppercase tracking-wide border-t mt-1 pt-2">
                  Union Territories
                </div>
                {unionTerritories.map((ut) => (
                  <SelectItem key={ut.code} value={ut.name}>
                    {ut.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Duplicate Location Warning/Status */}
          {(formData.city.trim() && formData.state) && (
            <div className="pt-2">
              {checkingDuplicate ? (
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400"></div>
                  <span>Checking for existing location...</span>
                </div>
              ) : existingLocation ? (
                <div className="flex items-center space-x-2 p-3 bg-amber-50 border border-amber-200 rounded-md">
                  <AlertTriangle className="h-4 w-4 text-amber-600 flex-shrink-0" />
                  <div className="flex-1">
                    <div className="text-sm font-medium text-amber-800">
                      Location already exists
                    </div>
                    <div className="text-xs text-amber-700 mt-1">
                      "{existingLocation.displayName}" is already in the database with {existingLocation.usageCount} uses.
                      Clicking "Add Location" will use the existing entry.
                    </div>
                  </div>
                  <Badge variant="secondary" className="bg-amber-100 text-amber-800 text-xs">
                    {existingLocation.usageCount} uses
                  </Badge>
                </div>
              ) : (
                <div className="flex items-center space-x-2 p-3 bg-green-50 border border-green-200 rounded-md">
                  <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                  <div className="text-sm text-green-800">
                    "{formData.city.trim()}, {formData.state}" is available and will be created as a new location.
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                resetForm();
                setOpen(false);
              }}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || !formData.city.trim() || !formData.state}
              className={existingLocation
                ? "bg-amber-600 hover:bg-amber-700 text-white"
                : "bg-blue-600 hover:bg-blue-700 text-white"
              }
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  {existingLocation ? "Using..." : "Creating..."}
                </>
              ) : existingLocation ? (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Use Existing Location
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Create New Location
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}