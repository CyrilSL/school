"use client";

import { useEffect, useState } from "react";
import { authClient } from "~/server/auth/client";
import { Button } from "~/components/ui/button";

interface Student {
  id: string;
  name: string;
  rollNumber: string;
  class: string;
  section: string;
}

interface FeeApplication {
  id: string;
  student: Student;
  feeStructure: {
    name: string;
    amount: string;
  };
  emiPlan?: {
    name: string;
    installments: number;
  };
  totalAmount: string;
  remainingAmount: string;
  status: "pending" | "approved" | "rejected";
  appliedAt: string;
  installments?: Array<{
    id: string;
    installmentNumber: number;
    amount: string;
    status: "pending" | "paid" | "overdue";
    dueDate: string;
    paidDate: string | null;
  }>;
}

export default function InstitutionDashboard() {
  console.log("🟢 Institution Dashboard: Component started rendering");

  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [feeApplications, setFeeApplications] = useState<FeeApplication[]>([]);

  useEffect(() => {
    console.log("🟢 Institution Dashboard: useEffect started");
    const initializeData = async () => {
      try {
        // Middleware already verified session and organization membership
        // So we can trust that the user is authenticated and is an institution user
        console.log("🟢 Institution Dashboard: Middleware verified auth, proceeding...");

        // Try to get session for display purposes, but don't block on it
        const session = await authClient.getSession();
        if (session?.user) {
          console.log("🟢 Institution Dashboard: Got user data for display");
          setUser(session.user);
        } else {
          console.log("🟡 Institution Dashboard: No client session yet, using placeholder");
          // Set a placeholder user since middleware verified auth
          setUser({ name: "Institution Admin", email: "Loading..." });
        }

        // Fetch EMI applications and platform payments data
        console.log("🟢 Institution Dashboard: Fetching payments data...");
        const response = await fetch("/api/institution/payments");
        if (response.ok) {
          const data = await response.json();
          console.log("🟢 Institution Dashboard: Payments data received");
          setFeeApplications(data.emiApplications || []);
        } else {
          console.log("🔴 Institution Dashboard: Failed to fetch payments data");
        }

        console.log("🟢 Institution Dashboard: Setting loading to false");
        setLoading(false);
      } catch (error) {
        console.error("🔴 Institution Dashboard: Error initializing dashboard:", error);
        setLoading(false);
      }
    };

    initializeData();
  }, []);

  // EMI applications are now managed entirely by the platform
  // Institutions only view the status and receive payments

  console.log("🟢 Institution Dashboard: Rendering, loading:", loading);

  if (loading) return <div>Loading...</div>;

  console.log("🟢 Institution Dashboard: About to return main content");

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Institution Dashboard</h1>
        <p className="text-gray-600">Welcome, {user?.name}</p>
        <div className="mt-2 p-2 bg-blue-100 rounded">
          <p className="text-sm text-blue-800">
            Role: Institution Admin | Organization: {user?.organizationId || "Not Assigned"}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="font-semibold text-gray-900">Total Applications</h3>
          <p className="text-2xl font-bold text-blue-600">{feeApplications.length}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="font-semibold text-gray-900">Platform Review</h3>
          <p className="text-2xl font-bold text-orange-600">
            {feeApplications.filter(app => app.status === "platform_review").length}
          </p>
          <p className="text-xs text-gray-500 mt-1">EMIs under platform review</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="font-semibold text-gray-900">Payment Pending</h3>
          <p className="text-2xl font-bold text-blue-600">
            {feeApplications.filter(app => app.status === "approved" && !app.platformPaidToInstitution).length}
          </p>
          <p className="text-xs text-gray-500 mt-1">Approved, payment due</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <Button 
            className="w-full h-full flex flex-col items-center justify-center"
            onClick={() => window.location.href = "/institution/dashboard/payments"}
          >
            <div className="text-sm font-medium mb-1">Platform</div>
            <div className="text-lg font-bold">Payments</div>
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b">
          <h2 className="text-xl font-semibold">EMI Applications (Platform Managed)</h2>
          <p className="text-sm text-gray-600 mt-1">
            These EMI applications are reviewed and approved by our platform. You will receive lump sum payments for approved applications.
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Student
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fee Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  EMI Plan
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {feeApplications.map((application) => (
                <tr key={application.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <p className="font-medium text-gray-900">{application.student.name}</p>
                      <p className="text-sm text-gray-500">
                        {application.student.rollNumber} - {application.student.class} {application.student.section}
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {application.feeStructure?.name || "N/A"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ₹{parseFloat(application.totalAmount).toLocaleString()}
                    {application.emiPlan && (
                      <div className="text-xs text-gray-500">
                        Remaining: ₹{parseFloat(application.remainingAmount).toLocaleString()}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {application.emiPlan?.name || "Full Payment"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      application.status === "approved" 
                        ? "bg-green-100 text-green-800"
                        : application.status === "rejected"
                        ? "bg-red-100 text-red-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}>
                      {application.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {application.status === "platform_review" && (
                      <span className="text-xs text-gray-500">Platform reviewing</span>
                    )}
                    {application.status === "approved" && !application.platformPaidToInstitution && (
                      <span className="text-xs text-green-600 font-medium">Payment processing</span>
                    )}
                    {application.platformPaidToInstitution && (
                      <span className="text-xs text-green-700 font-medium">✓ Paid</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}