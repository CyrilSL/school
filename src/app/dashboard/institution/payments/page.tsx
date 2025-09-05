"use client";

import { useEffect, useState } from "react";
import { authClient } from "~/server/auth/client";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";

interface PaymentRecord {
  applicationId: string;
  studentName: string;
  parentName: string;
  feeType: string;
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  installments: Array<{
    id: string;
    installmentNumber: number;
    amount: string;
    status: "pending" | "paid" | "overdue";
    dueDate: string;
    paidDate: string | null;
    paymentId: string | null;
  }>;
  emiPlan?: string;
  status: string;
}

export default function PaymentsPage() {
  const [loading, setLoading] = useState(true);
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [summary, setSummary] = useState({
    totalApplications: 0,
    pendingApprovals: 0,
    activeEMIs: 0,
    totalCollected: 0,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const session = await authClient.getSession();
        if (!session?.user) {
          window.location.href = "/login/institution";
          return;
        }

        const response = await fetch("/api/institution/fees");
        if (response.ok) {
          const data = await response.json();
          
          // Transform data for payment tracking
          const paymentRecords: PaymentRecord[] = data.applications.map((app: any) => ({
            applicationId: app.id,
            studentName: app.student?.name || "Unknown",
            parentName: "Parent", // Would need to fetch parent name from relations
            feeType: app.feeStructure?.name || "Unknown",
            totalAmount: parseFloat(app.totalAmount),
            paidAmount: parseFloat(app.totalAmount) - parseFloat(app.remainingAmount),
            remainingAmount: parseFloat(app.remainingAmount),
            installments: app.installments || [],
            emiPlan: app.emiPlan?.name,
            status: app.status,
          }));

          setPayments(paymentRecords);
          setSummary(data.summary || summary);
        }
      } catch (error) {
        console.error("Error fetching payment data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getPaymentStatus = (installments: any[]) => {
    if (!installments?.length) return "No EMI";
    
    const paidCount = installments.filter(i => i.status === "paid").length;
    const totalCount = installments.length;
    const overdueCount = installments.filter(i => 
      i.status === "pending" && new Date(i.dueDate) < new Date()
    ).length;

    if (paidCount === totalCount) return "Completed";
    if (overdueCount > 0) return "Overdue";
    if (paidCount > 0) return "In Progress";
    return "Not Started";
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Completed":
        return "bg-green-100 text-green-800";
      case "In Progress":
        return "bg-blue-100 text-blue-800";
      case "Overdue":
        return "bg-red-100 text-red-800";
      case "Not Started":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <Button onClick={() => window.history.back()} variant="outline" className="mb-4">
          ← Back to Dashboard
        </Button>
        
        <h1 className="text-3xl font-bold mb-2">Payment Tracking</h1>
        <p className="text-gray-600">Monitor fee payments and EMI progress</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-gray-600">Total Applications</div>
            <div className="text-2xl font-bold">{summary.totalApplications}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-gray-600">Active EMIs</div>
            <div className="text-2xl font-bold text-blue-600">{summary.activeEMIs}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-gray-600">Total Collected</div>
            <div className="text-2xl font-bold text-green-600">₹{summary.totalCollected.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-gray-600">Pending Approvals</div>
            <div className="text-2xl font-bold text-orange-600">{summary.pendingApprovals}</div>
          </CardContent>
        </Card>
      </div>

      {/* Payment Details */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Student
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fee Type
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Amount
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Paid
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Remaining
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    EMI Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Progress
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {payments.map((payment) => {
                  const paymentStatus = getPaymentStatus(payment.installments);
                  const progressPercentage = payment.totalAmount > 0 
                    ? ((payment.paidAmount / payment.totalAmount) * 100).toFixed(1)
                    : "0";

                  return (
                    <tr key={payment.applicationId}>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{payment.studentName}</div>
                          <div className="text-sm text-gray-500">Parent: {payment.parentName}</div>
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                        {payment.feeType}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                        ₹{payment.totalAmount.toLocaleString()}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-green-600 font-medium">
                        ₹{payment.paidAmount.toLocaleString()}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-orange-600 font-medium">
                        ₹{payment.remainingAmount.toLocaleString()}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(paymentStatus)}`}>
                          {paymentStatus}
                        </span>
                        {payment.emiPlan && (
                          <div className="text-xs text-gray-500 mt-1">{payment.emiPlan}</div>
                        )}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="flex items-center">
                          <div className="w-full bg-gray-200 rounded-full h-2.5 mr-2">
                            <div 
                              className="bg-green-600 h-2.5 rounded-full" 
                              style={{ width: `${progressPercentage}%` }}
                            ></div>
                          </div>
                          <span className="text-xs font-medium">{progressPercentage}%</span>
                        </div>
                        {payment.installments.length > 0 && (
                          <div className="text-xs text-gray-500 mt-1">
                            {payment.installments.filter(i => i.status === "paid").length}/{payment.installments.length} installments paid
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}