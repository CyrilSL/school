"use client";

import * as React from "react";
import { X, Plus } from "lucide-react";
import { cn } from "~/lib/utils";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { useToast } from "~/hooks/use-toast";

interface Location {
  id: string;
  displayName: string;
  city: string;
  state: string | null;
  usageCount: number;
}

interface LocationTagInputProps {
  tags: string[];
  onTagsChange: (tags: string[]) => void;
  placeholder?: string;
  className?: string;
}

export function LocationTagInput({
  tags,
  onTagsChange,
  placeholder = "Add locations...",
  className,
}: LocationTagInputProps) {
  const [inputValue, setInputValue] = React.useState("");
  const [showSuggestions, setShowSuggestions] = React.useState(false);
  const [locations, setLocations] = React.useState<Location[]>([]);
  const [loading, setLoading] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Debounced search
  const [searchTimeout, setSearchTimeout] = React.useState<NodeJS.Timeout | null>(null);

  // Fetch locations from API
  const fetchLocations = React.useCallback(async (search?: string) => {
    try {
      const url = `/api/locations${search ? `?search=${encodeURIComponent(search)}` : ''}`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error('Failed to fetch locations');
      }

      const data = await response.json();
      setLocations(data.locations || []);
    } catch (error) {
      console.error('Error fetching locations:', error);
      // Fallback to static suggestions if API fails
      const fallbackLocations = [
        "Mumbai, Maharashtra",
        "Delhi, Delhi",
        "Bangalore, Karnataka",
        "Chennai, Tamil Nadu",
        "Hyderabad, Telangana",
        "Pune, Maharashtra",
        "Kolkata, West Bengal",
        "Ahmedabad, Gujarat",
        "Jaipur, Rajasthan",
        "Surat, Gujarat"
      ].filter(loc =>
        !search || loc.toLowerCase().includes(search.toLowerCase())
      ).map((displayName, index) => ({
        id: `fallback_${index}`,
        displayName,
        city: displayName.split(',')[0] || '',
        state: displayName.split(',')[1]?.trim() || null,
        usageCount: 0
      }));
      setLocations(fallbackLocations);
    }
  }, []);

  // Load initial locations
  React.useEffect(() => {
    fetchLocations();
  }, [fetchLocations]);

  // Handle input change with debounced search
  const handleInputChange = (value: string) => {
    setInputValue(value);
    setShowSuggestions(true);

    // Clear existing timeout
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    // Set new timeout for debounced search
    if (value.trim()) {
      const timeout = setTimeout(() => {
        fetchLocations(value);
      }, 300);
      setSearchTimeout(timeout);
    } else {
      fetchLocations();
    }
  };

  // Filter suggestions based on input and exclude already selected tags
  const filteredSuggestions = locations.filter(
    (location) =>
      location.displayName.toLowerCase().includes(inputValue.toLowerCase()) &&
      !tags.includes(location.displayName)
  );

  // Check if input matches exactly an existing location
  const exactMatch = locations.find(
    loc => loc.displayName.toLowerCase() === inputValue.toLowerCase()
  );

  // Check if input looks like a valid location format (has comma)
  const isValidNewLocation = inputValue.includes(',') &&
    inputValue.split(',').every(part => part.trim().length > 0);

  const addExistingLocation = async (displayName: string) => {
    try {
      // Call API to increment usage count
      await fetch('/api/locations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ displayName }),
      });

      if (!tags.includes(displayName)) {
        onTagsChange([...tags, displayName]);
      }
      setInputValue("");
      setShowSuggestions(false);
    } catch (error) {
      console.error('Error updating location:', error);
      // Still add the tag even if API call fails
      if (!tags.includes(displayName)) {
        onTagsChange([...tags, displayName]);
      }
      setInputValue("");
      setShowSuggestions(false);
    }
  };

  const addNewLocation = async (displayName: string) => {
    if (!isValidNewLocation) {
      toast({
        title: "Invalid format",
        description: "Please use format: City, State (e.g., Mumbai, Maharashtra)",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/locations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ displayName: displayName.trim() }),
      });

      if (!response.ok) {
        throw new Error('Failed to create location');
      }

      const data = await response.json();

      // Add to tags
      if (!tags.includes(displayName)) {
        onTagsChange([...tags, displayName]);
      }

      // Refresh locations list
      fetchLocations();

      setInputValue("");
      setShowSuggestions(false);

      toast({
        title: "Location added",
        description: data.message || "Location added successfully",
      });
    } catch (error) {
      console.error('Error creating location:', error);
      toast({
        title: "Error",
        description: "Failed to add new location",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const removeTag = (tagToRemove: string) => {
    onTagsChange(tags.filter((tag) => tag !== tagToRemove));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && inputValue.trim()) {
      e.preventDefault();
      if (exactMatch) {
        addExistingLocation(exactMatch.displayName);
      } else if (isValidNewLocation) {
        addNewLocation(inputValue.trim());
      }
    } else if (e.key === "Backspace" && !inputValue && tags.length > 0) {
      removeTag(tags[tags.length - 1]);
    }
  };

  return (
    <div className={cn("relative", className)}>
      <div className="flex flex-wrap gap-2 p-2 border border-gray-200 rounded-md min-h-[42px] focus-within:border-blue-500">
        {tags.map((tag) => (
          <Badge
            key={tag}
            variant="secondary"
            className="bg-blue-100 text-blue-800 hover:bg-blue-200"
          >
            {tag}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="ml-1 h-4 w-4 p-0 hover:bg-transparent"
              onClick={() => removeTag(tag)}
            >
              <X className="h-3 w-3" />
            </Button>
          </Badge>
        ))}
        <Input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => handleInputChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setShowSuggestions(true)}
          placeholder={tags.length === 0 ? placeholder : ""}
          className="flex-1 border-none outline-none shadow-none min-w-[120px] focus-visible:ring-0 placeholder:text-gray-400"
          disabled={loading}
        />
      </div>

      {showSuggestions && (inputValue.length > 0 || filteredSuggestions.length > 0) && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-48 overflow-y-auto">
          {/* Existing location suggestions */}
          {filteredSuggestions.map((location) => (
            <button
              key={location.id}
              type="button"
              className="w-full px-3 py-2 text-left hover:bg-gray-100 focus:bg-gray-100 focus:outline-none flex items-center justify-between"
              onClick={() => addExistingLocation(location.displayName)}
            >
              <span>{location.displayName}</span>
              {location.usageCount > 0 && (
                <span className="text-xs text-gray-500">
                  {location.usageCount} uses
                </span>
              )}
            </button>
          ))}

          {/* Add new location option */}
          {inputValue.trim() && !exactMatch && isValidNewLocation && (
            <button
              type="button"
              className="w-full px-3 py-2 text-left hover:bg-green-50 focus:bg-green-50 focus:outline-none border-t border-gray-100 text-green-700 flex items-center"
              onClick={() => addNewLocation(inputValue.trim())}
              disabled={loading}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add "{inputValue.trim()}" as new location
            </button>
          )}

          {/* Help text */}
          {inputValue.trim() && !exactMatch && !isValidNewLocation && (
            <div className="px-3 py-2 text-sm text-gray-500 border-t border-gray-100">
              Format: City, State (e.g., Mumbai, Maharashtra)
            </div>
          )}

          {/* No results */}
          {filteredSuggestions.length === 0 && !inputValue.trim() && (
            <div className="px-3 py-2 text-sm text-gray-500">
              Start typing to search locations...
            </div>
          )}
        </div>
      )}
    </div>
  );
}