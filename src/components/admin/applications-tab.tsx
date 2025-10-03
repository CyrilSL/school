"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "~/components/ui/table";
import { Badge } from "~/components/ui/badge";
import { Input } from "~/components/ui/input";
import { Search, Eye, CheckCircle, XCircle, FileText, Loader2 } from "lucide-react";
import ApplicationDetailsDialog from "./application-details-dialog";

interface Application {
  id: string;
  status: string;
  appliedAt: string;
  approvedAt?: string;
  rejectedAt?: string;
  totalAmount: number;
  monthlyInstallment: number | null;
  student: {
    id: string;
    name: string;
    class: string | null;
    section: string | null;
    rollNumber: string | null;
    dateOfBirth?: string;
    feeAmount: number | null;
    feeType: string | null;
    previousSchool: string | null;
  };
  parent: {
    id: string;
    name: string;
    email: string;
    fullName?: string;
    applicantPan?: string;
    gender?: string;
    fatherName?: string;
    motherName?: string;
    aadhaarNumber?: string;
    drivingLicense?: string;
    voterId?: string;
    passport?: string;
    dateOfBirth?: string;
    residenceType?: string;
    educationQualification?: string;
    profession?: string;
    companyName?: string;
    designation?: string;
    monthlyIncome?: number;
    employmentType?: string;
    yearsInCurrentJob?: number;
    currentAddress?: string;
    currentPincode?: string;
    currentCity?: string;
    currentState?: string;
  };
  institution: {
    name: string;
    type: string;
    city: string | null;
    state: string | null;
  };
  feeStructure: {
    name: string;
    amount: number;
    academicYear: string;
    semester: string | null;
  };
  emiPlan: {
    name: string;
    installments: number;
    interestRate: number;
    processingFee: number;
  } | null;
}

export default function ApplicationsTab() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [processingAction, setProcessingAction] = useState<string | null>(null);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/applications");
      console.log("Fetch response status:", response.status);

      if (response.ok) {
        const data = await response.json();
        console.log("Applications data:", data);
        setApplications(data.applications || []);
      } else {
        const errorData = await response.json();
        console.error("API error:", response.status, errorData);
      }
    } catch (error) {
      console.error("Error fetching applications:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (applicationId: string, action: "approve" | "reject") => {
    if (!confirm(`Are you sure you want to ${action} this application?`)) {
      return;
    }

    setProcessingAction(applicationId);

    try {
      const response = await fetch(`/api/admin/applications/${applicationId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action }),
      });

      if (response.ok) {
        alert(`Application ${action}d successfully`);
        await fetchApplications();
      } else {
        throw new Error(`Failed to ${action} application`);
      }
    } catch (error) {
      console.error(`Error ${action}ing application:`, error);
      alert(`Failed to ${action} application. Please try again.`);
    } finally {
      setProcessingAction(null);
    }
  };

  const handleViewDetails = (application: Application) => {
    setSelectedApplication(application);
    setDialogOpen(true);
  };

  const filteredApplications = applications.filter((app) => {
    const matchesSearch =
      app.student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.parent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.parent.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.institution.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.id.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesFilter =
      filterStatus === "all" ||
      (filterStatus === "pending" && app.status === "platform_review") ||
      (filterStatus === "approved" && app.status === "approved") ||
      (filterStatus === "rejected" && app.status === "rejected");

    return matchesSearch && matchesFilter;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "platform_review":
        return <Badge variant="outline" className="border-yellow-600 text-yellow-600 bg-yellow-50">Pending Review</Badge>;
      case "approved":
        return <Badge variant="outline" className="border-green-600 text-green-600 bg-green-50">Approved</Badge>;
      case "rejected":
        return <Badge variant="destructive">Rejected</Badge>;
      case "active":
        return <Badge variant="default">Active</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const pendingCount = applications.filter(app => app.status === "platform_review").length;
  const approvedCount = applications.filter(app => app.status === "approved").length;
  const rejectedCount = applications.filter(app => app.status === "rejected").length;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Application Management</h2>
          <p className="text-muted-foreground">
            Review and manage parent applications for fee financing
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground">Total Applications</div>
            <div className="text-2xl font-bold">{applications.length}</div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-yellow-600">
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground">Pending Review</div>
            <div className="text-2xl font-bold text-yellow-600">{pendingCount}</div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-green-600">
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground">Approved</div>
            <div className="text-2xl font-bold text-green-600">{approvedCount}</div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-red-600">
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground">Rejected</div>
            <div className="text-2xl font-bold text-red-600">{rejectedCount}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <FileText className="h-5 w-5 text-blue-600" />
              <span>Applications ({filteredApplications.length})</span>
            </CardTitle>
            <div className="flex items-center gap-4">
              <div className="flex gap-2">
                <Button
                  variant={filterStatus === "all" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilterStatus("all")}
                >
                  All
                </Button>
                <Button
                  variant={filterStatus === "pending" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilterStatus("pending")}
                >
                  Pending ({pendingCount})
                </Button>
                <Button
                  variant={filterStatus === "approved" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilterStatus("approved")}
                >
                  Approved
                </Button>
                <Button
                  variant={filterStatus === "rejected" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilterStatus("rejected")}
                >
                  Rejected
                </Button>
              </div>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search applications..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 w-80"
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredApplications.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">No applications found</p>
            </div>
          ) : (
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Application ID</TableHead>
                    <TableHead>Parent Details</TableHead>
                    <TableHead>Student Details</TableHead>
                    <TableHead>Institution</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Applied Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredApplications.map((app) => (
                    <TableRow key={app.id}>
                      <TableCell className="font-mono text-xs">{app.id.slice(0, 8)}...</TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <div className="font-medium">{app.parent.name}</div>
                          <div className="text-sm text-muted-foreground">{app.parent.email}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <div className="font-medium">{app.student.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {app.student.class && `${app.student.class}${app.student.section ? ` - ${app.student.section}` : ''}`}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <div className="font-medium">{app.institution.name}</div>
                          <div className="text-sm text-muted-foreground">{app.institution.type}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">₹{app.totalAmount.toLocaleString()}</div>
                      </TableCell>
                      <TableCell>{getStatusBadge(app.status)}</TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {new Date(app.appliedAt).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewDetails(app)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                          {app.status === "platform_review" && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-green-600 border-green-600 hover:bg-green-50"
                                onClick={() => handleAction(app.id, "approve")}
                                disabled={processingAction === app.id}
                              >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Approve
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-red-600 border-red-600 hover:bg-red-50"
                                onClick={() => handleAction(app.id, "reject")}
                                disabled={processingAction === app.id}
                              >
                                <XCircle className="h-4 w-4 mr-1" />
                                Reject
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <ApplicationDetailsDialog
        application={selectedApplication}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </div>
  );
}
