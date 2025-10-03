"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { authClient } from "~/server/auth/client";
import { Badge } from "~/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";

export default function ApplicationDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [application, setApplication] = useState<any>(null);
  const [installments, setInstallments] = useState<any[]>([]);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [payingInstallment, setPayingInstallment] = useState<string | null>(null);

  useEffect(() => {
    console.log('Component mounted, fetching data...');
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Get application data
      console.log('Fetching application:', params.id);
      const appRes = await fetch(`/api/fees/applications/${params.id}`);
      console.log('Application response status:', appRes.status);

      if (appRes.status === 401 || appRes.status === 403) {
        console.log('Unauthorized, redirecting to login');
        router.push("/login/parent");
        return;
      }

      if (appRes.ok) {
        const appData = await appRes.json();
        console.log('Application data:', appData);
        setApplication(appData);

        // Get installments if application found
        if (appData?.id) {
          const insRes = await fetch(`/api/fees/installments?applicationId=${appData.id}`);
          console.log('Installments response status:', insRes.status);

          if (insRes.ok) {
            const insJson = await insRes.json();
            console.log('Installments data:', insJson);
            setInstallments(insJson.installments || []);
          }
        }
      } else {
        const errorText = await appRes.text();
        console.error('Application fetch error:', errorText);
        setFetchError('Unable to fetch application data.');
      }
    } catch (err) {
      console.error('Fetch error', err);
      setFetchError('Server error fetching data.');
    } finally {
      setLoading(false);
    }
  };

  const handlePayInstallment = async (installmentId: string) => {
    setPayingInstallment(installmentId);

    try {
      const response = await fetch("/api/parent/payment/emi", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ installmentId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Payment failed");
      }

      const data = await response.json();
      alert(`Payment successful! Transaction ID: ${data.data.transactionId}`);

      // Refresh data
      await fetchData();
    } catch (error) {
      console.error("Error processing payment:", error);
      alert(error instanceof Error ? error.message : "Failed to process payment");
    } finally {
      setPayingInstallment(null);
    }
  };

  const isOverdue = (dueDate: string, status: string) => {
    if (status === "paid") return false;
    return new Date(dueDate) < new Date();
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-12 text-center">
        <p>Loading...</p>
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="max-w-4xl mx-auto p-12 text-center">
        <h2 className="text-xl font-bold mb-4">Error</h2>
        <p>{fetchError}</p>
      </div>
    );
  }

  if (!application) {
    return (
      <div className="max-w-4xl mx-auto p-12 text-center">
        <h2 className="text-xl font-bold mb-4">Not Found</h2>
        <p>No application found for this ID.</p>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "verified":
      case "paid":
        return "bg-green-100 text-green-800";
      case "pending":
      case "upcoming":
        return "bg-yellow-100 text-yellow-800";
      case "rejected":
      case "overdue":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const totalPaid = installments
    .filter(i => i.status === "paid")
    .reduce((sum, i) => sum + parseFloat(i.amount || "0"), 0);

  const remainingAmount = parseFloat(application.totalAmount || "0") - totalPaid;
  const paidCount = installments.filter(i => i.status === "paid").length;
  const pendingCount = installments.filter(i => i.status === "pending").length;

  return (
    <div className="max-w-6xl">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">{application.student?.institution?.name || 'Application Details'}</h1>
            <p className="text-lg text-gray-700 mb-1">
              {application.student?.class && `${application.student.class} ${application.student.section ? `- Section ${application.student.section}` : ''}`}
            </p>
            <p className="text-sm text-gray-600">Application ID: {application.id}</p>
          </div>
          <Badge className={getStatusColor(application.status)}>
            {application.status === "emi_pending" ? "EMI Setup Required" : "In Progress"}
          </Badge>
        </div>
      </div>

      {/* Payment Summary Cards */}
      <div className="grid gap-6 md:grid-cols-4 mb-6">
        <Card className="border-l-4 border-l-blue-600">
          <CardContent className="p-4">
            <div className="text-sm text-gray-600">Total Amount</div>
            <div className="text-2xl font-bold">₹{Number(application.totalAmount || 0).toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-green-600">
          <CardContent className="p-4">
            <div className="text-sm text-gray-600">Amount Paid</div>
            <div className="text-2xl font-bold text-green-600">₹{totalPaid.toLocaleString()}</div>
            <div className="text-xs text-gray-500 mt-1">{paidCount} installments</div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-orange-600">
          <CardContent className="p-4">
            <div className="text-sm text-gray-600">Remaining</div>
            <div className="text-2xl font-bold text-orange-600">₹{remainingAmount.toLocaleString()}</div>
            <div className="text-xs text-gray-500 mt-1">{pendingCount} installments</div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-purple-600">
          <CardContent className="p-4">
            <div className="text-sm text-gray-600">Progress</div>
            <div className="text-2xl font-bold">{Math.round((totalPaid / parseFloat(application.totalAmount || "1")) * 100)}%</div>
            <div className="text-xs text-gray-500 mt-1">{paidCount}/{installments.length} paid</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Application Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Application Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-gray-600">Institution</div>
                <div className="font-medium">{application.student?.institution?.name || '-'}</div>
              </div>
              <div>
                <div className="text-gray-600">Academic Year</div>
                <div className="font-medium">{application.feeStructure?.academicYear || '-'}</div>
              </div>
              <div>
                <div className="text-gray-600">Student Name</div>
                <div className="font-medium">{application.student?.name || '-'}</div>
              </div>
              <div>
                <div className="text-gray-600">Class / Course</div>
                <div className="font-medium">{application.student?.class ? `${application.student.class}${application.student.section ? ` - ${application.student.section}` : ''}` : '-'}</div>
              </div>
              <div>
                <div className="text-gray-600">Fee Type</div>
                <div className="font-medium">{application.feeStructure?.name || '-'}</div>
              </div>
              <div>
                <div className="text-gray-600">Submitted Date</div>
                <div className="font-medium">{application.appliedAt ? new Date(application.appliedAt).toLocaleDateString() : '-'}</div>
              </div>
            </div>
            <div className="pt-2 border-t">
              <div className="text-gray-600 text-sm">Total Fees</div>
              <div className="text-2xl font-bold text-green-600">
                ₹{Number(application.totalAmount).toLocaleString()}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* EMI Plan Details */}
        <Card>
          <CardHeader>
            <CardTitle>EMI Plan Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-gray-600">No. of Installments</div>
                <div className="font-medium">{application.emiPlan?.installments || '-'}</div>
              </div>
              <div>
                <div className="text-gray-600">Monthly Amount</div>
                <div className="font-medium">₹{application.monthlyInstallment ? Number(application.monthlyInstallment).toLocaleString() : '-'}</div>
              </div>
              <div>
                <div className="text-gray-600">Interest Rate</div>
                <div className="font-medium">{application.emiPlan?.interestRate || '-'}% p.a.</div>
              </div>
              <div>
                <div className="text-gray-600">Processing Fee</div>
                <div className="font-medium">₹{application.emiPlan?.processingFee ? Number(application.emiPlan.processingFee).toLocaleString() : '-'}</div>
              </div>
            </div>
          </CardContent>
          {application.status === "emi_pending" && (
            <div className="p-6 pt-0">
              <Button className="w-full bg-orange-600 hover:bg-orange-700">
                Complete EMI Setup
              </Button>
            </div>
          )}
        </Card>

        {/* Document Status (Placeholder, real docs integration needed) */}
        <Card>
          <CardHeader>
            <CardTitle>Document Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center text-gray-500 py-8">
              Document management coming soon
            </div>
          </CardContent>
        </Card>

        {/* Payment Schedule */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Payment Schedule & Installments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Installment
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Due Date
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {installments.map((installment: any, index: number) => {
                    const status = installment.status === "pending" && isOverdue(installment.dueDate, installment.status)
                      ? "overdue"
                      : installment.status;

                    return (
                      <tr key={installment.id || index}>
                        <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          #{installment.installmentNumber || index + 1}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                          ₹{installment.amount ? Number(installment.amount).toLocaleString() : '-'}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                          {installment.dueDate ? new Date(installment.dueDate).toLocaleDateString() : '-'}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <Badge className={getStatusColor(status)}>
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                          </Badge>
                          {installment.paidDate && (
                            <div className="text-xs text-gray-500 mt-1">
                              Paid: {new Date(installment.paidDate).toLocaleDateString()}
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                          {installment.status === "pending" && (
                            <Button
                              size="sm"
                              onClick={() => handlePayInstallment(installment.id)}
                              className={status === "overdue" ? "bg-red-600 hover:bg-red-700 text-white" : "bg-blue-600 hover:bg-blue-700 text-white"}
                              disabled={payingInstallment === installment.id}
                            >
                              {payingInstallment === installment.id ? "Processing..." : "Pay Now"}
                            </Button>
                          )}
                          {installment.status === "paid" && installment.paymentId && (
                            <div className="text-xs text-gray-500">
                              Payment ID: {installment.paymentId}
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {installments.length === 0 && (
                <div className="text-center text-gray-500 py-8">
                  No payment schedule available
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="mt-8 flex gap-4">
        <Button variant="outline" asChild>
          <a href="/parent/dashboard">Back to Applications</a>
        </Button>
        {application.status === "emi_pending" && (
          <Button className="bg-orange-600 hover:bg-orange-700">
            Complete EMI Form
          </Button>
        )}
        <Button variant="outline">
          Download Details
        </Button>
      </div>
    </div>
  );
}
