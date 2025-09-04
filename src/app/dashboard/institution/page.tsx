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
  feeType: string;
  amount: number;
  status: "pending" | "approved" | "rejected";
  emiPlan?: string;
  appliedAt: string;
}

export default function InstitutionDashboard() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [feeApplications, setFeeApplications] = useState<FeeApplication[]>([]);

  useEffect(() => {
    authClient.getSession().then((session) => {
      setUser(session?.user);
      setLoading(false);
    });

    // Mock data for demonstration
    setFeeApplications([
      {
        id: "1",
        student: {
          id: "s1",
          name: "John Doe",
          rollNumber: "2024001",
          class: "Class 10",
          section: "A",
        },
        feeType: "Tuition Fee",
        amount: 50000,
        status: "pending",
        emiPlan: "6 months",
        appliedAt: "2024-03-15",
      },
      {
        id: "2",
        student: {
          id: "s2",
          name: "Jane Smith",
          rollNumber: "2024002",
          class: "Class 9",
          section: "B",
        },
        feeType: "Hostel Fee",
        amount: 25000,
        status: "approved",
        emiPlan: "3 months",
        appliedAt: "2024-03-10",
      },
    ]);
  }, []);

  const handleApplicationAction = (applicationId: string, action: "approve" | "reject") => {
    setFeeApplications(prev =>
      prev.map(app =>
        app.id === applicationId
          ? { ...app, status: action === "approve" ? "approved" : "rejected" }
          : app
      )
    );
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Institution Dashboard</h1>
        <p className="text-gray-600">Welcome, {user?.name}</p>
        <div className="mt-2 p-2 bg-blue-100 rounded">
          <p className="text-sm text-blue-800">
            Role: Institution Admin | Organization: {user?.organizationId || "Demo Institution"}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="font-semibold text-gray-900">Total Applications</h3>
          <p className="text-2xl font-bold text-blue-600">{feeApplications.length}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="font-semibold text-gray-900">Pending Approvals</h3>
          <p className="text-2xl font-bold text-orange-600">
            {feeApplications.filter(app => app.status === "pending").length}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="font-semibold text-gray-900">Approved EMIs</h3>
          <p className="text-2xl font-bold text-green-600">
            {feeApplications.filter(app => app.status === "approved").length}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b">
          <h2 className="text-xl font-semibold">Fee Applications</h2>
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
                    {application.feeType}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ₹{application.amount.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {application.emiPlan}
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
                    {application.status === "pending" && (
                      <div className="space-x-2">
                        <Button
                          size="sm"
                          onClick={() => handleApplicationAction(application.id, "approve")}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleApplicationAction(application.id, "reject")}
                        >
                          Reject
                        </Button>
                      </div>
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