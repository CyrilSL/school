"use client";

import { useState, useEffect } from "react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Trash2, MapPin, Plus, Search } from "lucide-react";
import { useToast } from "~/hooks/use-toast";
import { INDIAN_STATES, getStatesGrouped } from "~/lib/indian-states";

interface Location {
  id: string;
  city: string;
  state: string | null;
  displayName: string;
  usageCount: number;
  isActive: boolean;
  createdAt: string;
}

interface AddLocationForm {
  city: string;
  state: string;
}

export default function LocationManagement() {
  const { toast } = useToast();
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState<AddLocationForm>({
    city: "",
    state: ""
  });
  const [addingLocation, setAddingLocation] = useState(false);

  const { states, unionTerritories } = getStatesGrouped();

  // Fetch locations
  const fetchLocations = async (search?: string) => {
    try {
      setLoading(true);
      const url = `/api/locations${search ? `?search=${encodeURIComponent(search)}` : '?limit=100'}`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error('Failed to fetch locations');
      }

      const data = await response.json();
      setLocations(data.locations || []);
    } catch (error) {
      console.error('Error fetching locations:', error);
      toast({
        title: "Error",
        description: "Failed to fetch locations",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Load locations on mount
  useEffect(() => {
    fetchLocations();
  }, []);

  // Handle search with debounce
  useEffect(() => {
    const timeout = setTimeout(() => {
      fetchLocations(searchTerm);
    }, 300);

    return () => clearTimeout(timeout);
  }, [searchTerm]);

  // Handle form submission
  const handleAddLocation = async (e: React.FormEvent) => {
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

    setAddingLocation(true);
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
        title: "Success",
        description: data.message || "Location added successfully",
      });

      // Reset form
      setFormData({ city: "", state: "" });

      // Refresh locations list
      fetchLocations(searchTerm);

    } catch (error) {
      console.error('Error adding location:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add location",
        variant: "destructive"
      });
    } finally {
      setAddingLocation(false);
    }
  };

  // Delete location (you might want to add this API endpoint)
  const handleDeleteLocation = async (locationId: string) => {
    if (!confirm("Are you sure you want to delete this location?")) {
      return;
    }

    try {
      const response = await fetch(`/api/locations/${locationId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete location');
      }

      toast({
        title: "Success",
        description: "Location deleted successfully",
      });

      // Refresh locations list
      fetchLocations(searchTerm);

    } catch (error) {
      console.error('Error deleting location:', error);
      toast({
        title: "Error",
        description: "Failed to delete location",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-2">
        <MapPin className="h-6 w-6 text-blue-600" />
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Location Management</h2>
          <p className="text-gray-600">Manage available cities and locations</p>
        </div>
      </div>

      {/* Add New Location Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Plus className="h-5 w-5" />
            <span>Add New Location</span>
          </CardTitle>
          <CardDescription>
            Add a new city/location that institutions can use
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAddLocation} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">City Name *</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                  placeholder="Enter city name (e.g., Nashik)"
                  className="placeholder:text-gray-400"
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
                  <SelectContent className="bg-white border border-gray-200 shadow-lg max-h-60">
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
            </div>

            <Button
              type="submit"
              disabled={addingLocation || !formData.city.trim() || !formData.state}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {addingLocation ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Adding...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Location
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Search and List */}
      <Card>
        <CardHeader>
          <CardTitle>Existing Locations</CardTitle>
          <CardDescription>
            All available locations in the system ({locations.length} total)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Search */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search locations..."
              className="pl-10 placeholder:text-gray-400"
            />
          </div>

          {/* Loading */}
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            /* Locations Grid */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {locations.map((location) => (
                <div
                  key={location.id}
                  className="p-3 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{location.displayName}</h4>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge variant="secondary" className="text-xs">
                          {location.usageCount} uses
                        </Badge>
                        {!location.isActive && (
                          <Badge variant="destructive" className="text-xs">
                            Inactive
                          </Badge>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteLocation(location.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}

              {locations.length === 0 && !loading && (
                <div className="col-span-full text-center py-8 text-gray-500">
                  {searchTerm ? "No locations found matching your search" : "No locations available"}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}