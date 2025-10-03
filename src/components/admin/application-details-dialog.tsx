"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Separator } from "~/components/ui/separator";
import { User, GraduationCap, Building, CreditCard, FileText, Briefcase, Home } from "lucide-react";

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

interface ApplicationDetailsDialogProps {
  application: Application | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ApplicationDetailsDialog({
  application,
  open,
  onOpenChange,
}: ApplicationDetailsDialogProps) {
  if (!application) return null;

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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white dark:bg-slate-950">
        <DialogHeader>
          <DialogTitle className="text-2xl">Application Details</DialogTitle>
          <DialogDescription>
            Complete information about the application and applicant
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Application Overview */}
          <Card className="bg-card">
            <CardHeader className="bg-muted/50">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="h-5 w-5 text-blue-600" />
                  Application Overview
                </CardTitle>
                {getStatusBadge(application.status)}
              </div>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-muted-foreground">Application ID</div>
                <div className="font-medium font-mono">{application.id}</div>
              </div>
              <div>
                <div className="text-muted-foreground">Applied Date</div>
                <div className="font-medium">{new Date(application.appliedAt).toLocaleString()}</div>
              </div>
              <div>
                <div className="text-muted-foreground">Total Amount</div>
                <div className="font-bold text-green-600 text-lg">₹{application.totalAmount.toLocaleString()}</div>
              </div>
              <div>
                <div className="text-muted-foreground">Monthly Installment</div>
                <div className="font-medium">
                  {application.monthlyInstallment ? `₹${application.monthlyInstallment.toLocaleString()}` : '-'}
                </div>
              </div>
              {application.approvedAt && (
                <div>
                  <div className="text-muted-foreground">Approved Date</div>
                  <div className="font-medium">{new Date(application.approvedAt).toLocaleString()}</div>
                </div>
              )}
              {application.rejectedAt && (
                <div>
                  <div className="text-muted-foreground">Rejected Date</div>
                  <div className="font-medium">{new Date(application.rejectedAt).toLocaleString()}</div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Student Details */}
          <Card className="bg-card border">
            <CardHeader className="bg-muted/50">
              <CardTitle className="text-lg flex items-center gap-2">
                <GraduationCap className="h-5 w-5 text-blue-600" />
                Student Details
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-muted-foreground">Student Name</div>
                <div className="font-medium">{application.student.name}</div>
              </div>
              <div>
                <div className="text-muted-foreground">Class / Section</div>
                <div className="font-medium">
                  {application.student.class}
                  {application.student.section && ` - ${application.student.section}`}
                </div>
              </div>
              {application.student.rollNumber && (
                <div>
                  <div className="text-muted-foreground">Roll Number</div>
                  <div className="font-medium">{application.student.rollNumber}</div>
                </div>
              )}
              {application.student.dateOfBirth && (
                <div>
                  <div className="text-muted-foreground">Date of Birth</div>
                  <div className="font-medium">{new Date(application.student.dateOfBirth).toLocaleDateString()}</div>
                </div>
              )}
              {application.student.previousSchool && (
                <div className="col-span-2">
                  <div className="text-muted-foreground">Previous School</div>
                  <div className="font-medium">{application.student.previousSchool}</div>
                </div>
              )}
              {application.student.feeType && (
                <div>
                  <div className="text-muted-foreground">Fee Type</div>
                  <div className="font-medium">{application.student.feeType}</div>
                </div>
              )}
              {application.student.feeAmount && (
                <div>
                  <div className="text-muted-foreground">Fee Amount</div>
                  <div className="font-medium">₹{application.student.feeAmount.toLocaleString()}</div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Parent Personal Details */}
          <Card className="bg-card border">
            <CardHeader className="bg-muted/50">
              <CardTitle className="text-lg flex items-center gap-2">
                <User className="h-5 w-5 text-blue-600" />
                Parent Personal Details
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-muted-foreground">Account Name</div>
                <div className="font-medium">{application.parent.name}</div>
              </div>
              <div>
                <div className="text-muted-foreground">Email</div>
                <div className="font-medium">{application.parent.email}</div>
              </div>
              {application.parent.fullName && (
                <div>
                  <div className="text-muted-foreground">Full Name</div>
                  <div className="font-medium">{application.parent.fullName}</div>
                </div>
              )}
              {application.parent.gender && (
                <div>
                  <div className="text-muted-foreground">Gender</div>
                  <div className="font-medium">{application.parent.gender}</div>
                </div>
              )}
              {application.parent.dateOfBirth && (
                <div>
                  <div className="text-muted-foreground">Date of Birth</div>
                  <div className="font-medium">{new Date(application.parent.dateOfBirth).toLocaleDateString()}</div>
                </div>
              )}
              {application.parent.fatherName && (
                <div>
                  <div className="text-muted-foreground">Father's Name</div>
                  <div className="font-medium">{application.parent.fatherName}</div>
                </div>
              )}
              {application.parent.motherName && (
                <div>
                  <div className="text-muted-foreground">Mother's Name</div>
                  <div className="font-medium">{application.parent.motherName}</div>
                </div>
              )}
              {application.parent.applicantPan && (
                <div>
                  <div className="text-muted-foreground">PAN Number</div>
                  <div className="font-medium font-mono">{application.parent.applicantPan}</div>
                </div>
              )}
              {application.parent.aadhaarNumber && (
                <div>
                  <div className="text-muted-foreground">Aadhaar Number</div>
                  <div className="font-medium font-mono">{application.parent.aadhaarNumber}</div>
                </div>
              )}
              {application.parent.drivingLicense && (
                <div>
                  <div className="text-muted-foreground">Driving License</div>
                  <div className="font-medium font-mono">{application.parent.drivingLicense}</div>
                </div>
              )}
              {application.parent.voterId && (
                <div>
                  <div className="text-muted-foreground">Voter ID</div>
                  <div className="font-medium font-mono">{application.parent.voterId}</div>
                </div>
              )}
              {application.parent.passport && (
                <div>
                  <div className="text-muted-foreground">Passport</div>
                  <div className="font-medium font-mono">{application.parent.passport}</div>
                </div>
              )}
              {application.parent.educationQualification && (
                <div>
                  <div className="text-muted-foreground">Education</div>
                  <div className="font-medium">{application.parent.educationQualification}</div>
                </div>
              )}
              {application.parent.residenceType && (
                <div>
                  <div className="text-muted-foreground">Residence Type</div>
                  <div className="font-medium">{application.parent.residenceType}</div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Employment Details */}
          {(application.parent.profession || application.parent.companyName) && (
            <Card className="bg-card border">
              <CardHeader className="bg-muted/50">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Briefcase className="h-5 w-5 text-blue-600" />
                  Employment Details
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-4 text-sm">
                {application.parent.profession && (
                  <div>
                    <div className="text-muted-foreground">Profession</div>
                    <div className="font-medium">{application.parent.profession}</div>
                  </div>
                )}
                {application.parent.employmentType && (
                  <div>
                    <div className="text-muted-foreground">Employment Type</div>
                    <div className="font-medium">{application.parent.employmentType}</div>
                  </div>
                )}
                {application.parent.companyName && (
                  <div>
                    <div className="text-muted-foreground">Company Name</div>
                    <div className="font-medium">{application.parent.companyName}</div>
                  </div>
                )}
                {application.parent.designation && (
                  <div>
                    <div className="text-muted-foreground">Designation</div>
                    <div className="font-medium">{application.parent.designation}</div>
                  </div>
                )}
                {application.parent.monthlyIncome && (
                  <div>
                    <div className="text-muted-foreground">Monthly Income</div>
                    <div className="font-medium">₹{application.parent.monthlyIncome.toLocaleString()}</div>
                  </div>
                )}
                {application.parent.yearsInCurrentJob && (
                  <div>
                    <div className="text-muted-foreground">Years in Current Job</div>
                    <div className="font-medium">{application.parent.yearsInCurrentJob} years</div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Address Details */}
          {application.parent.currentAddress && (
            <Card className="bg-card border">
              <CardHeader className="bg-muted/50">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Home className="h-5 w-5 text-blue-600" />
                  Address Details
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-4 text-sm">
                <div className="col-span-2">
                  <div className="text-muted-foreground">Current Address</div>
                  <div className="font-medium">{application.parent.currentAddress}</div>
                </div>
                {application.parent.currentCity && (
                  <div>
                    <div className="text-muted-foreground">City</div>
                    <div className="font-medium">{application.parent.currentCity}</div>
                  </div>
                )}
                {application.parent.currentState && (
                  <div>
                    <div className="text-muted-foreground">State</div>
                    <div className="font-medium">{application.parent.currentState}</div>
                  </div>
                )}
                {application.parent.currentPincode && (
                  <div>
                    <div className="text-muted-foreground">Pincode</div>
                    <div className="font-medium">{application.parent.currentPincode}</div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Institution Details */}
          <Card className="bg-card border">
            <CardHeader className="bg-muted/50">
              <CardTitle className="text-lg flex items-center gap-2">
                <Building className="h-5 w-5 text-blue-600" />
                Institution Details
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-muted-foreground">Institution Name</div>
                <div className="font-medium">{application.institution.name}</div>
              </div>
              <div>
                <div className="text-muted-foreground">Type</div>
                <div className="font-medium">{application.institution.type}</div>
              </div>
              <div>
                <div className="text-muted-foreground">City</div>
                <div className="font-medium">{application.institution.city || '-'}</div>
              </div>
              <div>
                <div className="text-muted-foreground">State</div>
                <div className="font-medium">{application.institution.state || '-'}</div>
              </div>
            </CardContent>
          </Card>

          {/* Fee Structure */}
          <Card className="bg-card border">
            <CardHeader className="bg-muted/50">
              <CardTitle className="text-lg flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-blue-600" />
                Fee Structure & EMI Plan
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-muted-foreground">Fee Structure</div>
                <div className="font-medium">{application.feeStructure.name}</div>
              </div>
              <div>
                <div className="text-muted-foreground">Academic Year</div>
                <div className="font-medium">{application.feeStructure.academicYear}</div>
              </div>
              {application.feeStructure.semester && (
                <div>
                  <div className="text-muted-foreground">Semester</div>
                  <div className="font-medium">{application.feeStructure.semester}</div>
                </div>
              )}
              <div>
                <div className="text-muted-foreground">Base Fee Amount</div>
                <div className="font-medium">₹{application.feeStructure.amount.toLocaleString()}</div>
              </div>

              {application.emiPlan && (
                <>
                  <Separator className="col-span-2" />
                  <div>
                    <div className="text-muted-foreground">EMI Plan</div>
                    <div className="font-medium">{application.emiPlan.name}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Number of Installments</div>
                    <div className="font-medium">{application.emiPlan.installments} months</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Interest Rate</div>
                    <div className="font-medium">{application.emiPlan.interestRate}% p.a.</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Processing Fee</div>
                    <div className="font-medium">₹{application.emiPlan.processingFee.toLocaleString()}</div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}
