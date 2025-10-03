"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { Button } from "~/components/ui/button";

interface DeleteApplicationButtonProps {
  applicationId: string;
  institutionName: string;
  status: string;
}

export default function DeleteApplicationButton({
  applicationId,
  institutionName,
  status,
}: DeleteApplicationButtonProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Only show delete button for applications in filling stage (onboarding_pending or emi_pending)
  const canDelete = ["onboarding_pending", "emi_pending"].includes(status);

  if (!canDelete) {
    return null;
  }

  const handleDelete = async () => {
    if (!showConfirm) {
      setShowConfirm(true);
      return;
    }

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/parent/applications/${applicationId}/delete`, {
        method: "DELETE",
      });

      if (response.ok) {
        // Redirect to apply page or refresh the page
        router.push("/parent/apply");
        router.refresh();
      } else {
        const data = await response.json();
        alert(data.error || "Failed to delete application");
      }
    } catch (error) {
      console.error("Error deleting application:", error);
      alert("Failed to delete application");
    } finally {
      setIsDeleting(false);
      setShowConfirm(false);
    }
  };

  if (showConfirm) {
    return (
      <div className="space-y-2">
        <p className="text-sm text-gray-600">
          Delete application for <strong>{institutionName}</strong>? This cannot be undone.
        </p>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowConfirm(false)}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDelete}
            disabled={isDeleting}
            className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
          >
            {isDeleting ? "Deleting..." : "Confirm Delete"}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => setShowConfirm(true)}
      className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
    >
      <Trash2 className="h-4 w-4 mr-1" />
      Delete
    </Button>
  );
}
