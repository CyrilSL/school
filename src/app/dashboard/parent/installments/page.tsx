"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { authClient } from "~/server/auth/client";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import PaymentModal from "~/components/payment/PaymentModal";

interface Installment {
  id: string;
  installmentNumber: number;
  amount: string;
  dueDate: string;
  paidDate: string | null;
  status: "pending" | "paid" | "overdue";
  paymentId: string | null;
}

interface FeeApplication {
  id: string;
  totalAmount: string;
  remainingAmount: string;
  monthlyInstallment: string;
  status: string;
  feeStructure: {
    name: string;
    academicYear: string;
  };
  emiPlan: {
    name: string;
    installments: number;
  };
}

export default function InstallmentsPage() {
  const searchParams = useSearchParams();
  const applicationId = searchParams.get("applicationId");
  
  const [loading, setLoading] = useState(true);
  const [installments, setInstallments] = useState<Installment[]>([]);
  const [application, setApplication] = useState<FeeApplication | null>(null);
  const [payingInstallment, setPayingInstallment] = useState<string | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedInstallment, setSelectedInstallment] = useState<Installment | null>(null);

  useEffect(() => {
    if (!applicationId) return;

    const fetchData = async () => {
      try {
        const session = await authClient.getSession();
        if (!session?.user) {
          window.location.href = "/login/parent";
          return;
        }

        const response = await fetch(`/api/fees/installments?applicationId=${applicationId}`);
        if (response.ok) {
          const data = await response.json();
          setInstallments(data.installments || []);
        }

        // Get application details from the applications API
        const appResponse = await fetch("/api/fees/applications");
        if (appResponse.ok) {
          const appData = await appResponse.json();
          const app = appData.applications.find((a: FeeApplication) => a.id === applicationId);
          setApplication(app || null);
        }
      } catch (error) {
        console.error("Error fetching installments:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [applicationId]);

  const handlePayInstallment = (installment: Installment) => {
    setSelectedInstallment(installment);
    setShowPaymentModal(true);
  };

  const handlePaymentSuccess = async (paymentId: string) => {
    alert(`Payment successful! Payment ID: ${paymentId}`);
    
    // Refresh installments
    try {
      const refreshResponse = await fetch(`/api/fees/installments?applicationId=${applicationId}`);
      if (refreshResponse.ok) {
        const data = await refreshResponse.json();
        setInstallments(data.installments || []);
      }
    } catch (error) {
      console.error("Error refreshing installments:", error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-800";
      case "overdue":
        return "bg-red-100 text-red-800";
      default:
        return "bg-yellow-100 text-yellow-800";
    }
  };

  const isOverdue = (dueDate: string, status: string) => {
    if (status === "paid") return false;
    return new Date(dueDate) < new Date();
  };

  if (loading) return <div>Loading...</div>;

  if (!application) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Application Not Found</h1>
          <Button onClick={() => window.history.back()}>Go Back</Button>
        </div>
      </div>
    );
  }

  const totalPaid = installments
    .filter(i => i.status === "paid")
    .reduce((sum, i) => sum + parseFloat(i.amount), 0);

  const remainingAmount = parseFloat(application.totalAmount) - totalPaid;

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <Button onClick={() => window.history.back()} variant="outline" className="mb-4">
          ← Back to Dashboard
        </Button>
        
        <h1 className="text-3xl font-bold mb-2">EMI Installments</h1>
        <p className="text-gray-600">{application.feeStructure.name} - {application.feeStructure.academicYear}</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-gray-600">Total Amount</div>
            <div className="text-2xl font-bold">₹{parseFloat(application.totalAmount).toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-gray-600">Amount Paid</div>
            <div className="text-2xl font-bold text-green-600">₹{totalPaid.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-gray-600">Remaining</div>
            <div className="text-2xl font-bold text-orange-600">₹{remainingAmount.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-gray-600">EMI Plan</div>
            <div className="text-xl font-bold">{application.emiPlan.name}</div>
          </CardContent>
        </Card>
      </div>

      {/* Installments List */}
      <Card>
        <CardHeader>
          <CardTitle>Installment Schedule</CardTitle>
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
                {installments.map((installment) => {
                  const status = installment.status === "pending" && isOverdue(installment.dueDate, installment.status) 
                    ? "overdue" 
                    : installment.status;
                  
                  return (
                    <tr key={installment.id}>
                      <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        #{installment.installmentNumber}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                        ₹{parseFloat(installment.amount).toLocaleString()}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(installment.dueDate).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(status)}`}>
                          {status}
                        </span>
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
                            onClick={() => handlePayInstallment(installment)}
                            className={status === "overdue" ? "bg-red-600 hover:bg-red-700" : ""}
                          >
                            Pay Now
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
          </div>
        </CardContent>
      </Card>

      {/* Payment Modal */}
      {selectedInstallment && (
        <PaymentModal
          isOpen={showPaymentModal}
          onClose={() => {
            setShowPaymentModal(false);
            setSelectedInstallment(null);
          }}
          installment={selectedInstallment}
          onSuccess={handlePaymentSuccess}
        />
      )}
    </div>
  );
}