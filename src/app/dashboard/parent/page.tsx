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
  institution: string;
}

interface FeeStructure {
  id: string;
  name: string;
  amount: number;
  dueDate: string;
  academicYear: string;
}

interface EmiPlan {
  id: string;
  name: string;
  installments: number;
  monthlyAmount: number;
  interestRate: number;
}

interface FeeApplication {
  id: string;
  feeStructure: FeeStructure;
  emiPlan: EmiPlan;
  status: "pending" | "approved" | "rejected";
  appliedAt: string;
}

export default function ParentDashboard() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [availableFees, setAvailableFees] = useState<FeeStructure[]>([]);
  const [emiPlans, setEmiPlans] = useState<EmiPlan[]>([]);
  const [applications, setApplications] = useState<FeeApplication[]>([]);

  useEffect(() => {
    authClient.getSession().then((session) => {
      setUser(session?.user);
      setLoading(false);
    });

    // Mock data for demonstration
    setStudents([
      {
        id: "s1",
        name: "Alex Johnson",
        rollNumber: "2024001",
        class: "Class 10",
        section: "A",
        institution: "Delhi Public School",
      },
    ]);

    setAvailableFees([
      {
        id: "f1",
        name: "Tuition Fee - Semester 1",
        amount: 50000,
        dueDate: "2024-06-30",
        academicYear: "2024-25",
      },
      {
        id: "f2",
        name: "Hostel Fee",
        amount: 25000,
        dueDate: "2024-07-15",
        academicYear: "2024-25",
      },
      {
        id: "f3",
        name: "Lab Fee",
        amount: 10000,
        dueDate: "2024-08-01",
        academicYear: "2024-25",
      },
    ]);

    setEmiPlans([
      {
        id: "e1",
        name: "3 Months EMI",
        installments: 3,
        monthlyAmount: 0, // Will be calculated
        interestRate: 0,
      },
      {
        id: "e2",
        name: "6 Months EMI",
        installments: 6,
        monthlyAmount: 0, // Will be calculated
        interestRate: 0,
      },
      {
        id: "e3",
        name: "12 Months EMI",
        installments: 12,
        monthlyAmount: 0, // Will be calculated
        interestRate: 0,
      },
    ]);

    setApplications([
      {
        id: "a1",
        feeStructure: {
          id: "f1",
          name: "Tuition Fee - Previous Semester",
          amount: 45000,
          dueDate: "2024-03-31",
          academicYear: "2023-24",
        },
        emiPlan: {
          id: "e2",
          name: "6 Months EMI",
          installments: 6,
          monthlyAmount: 7500,
          interestRate: 0,
        },
        status: "approved",
        appliedAt: "2024-02-15",
      },
    ]);
  }, []);

  const applyForEMI = (feeId: string, emiPlanId: string) => {
    const fee = availableFees.find(f => f.id === feeId);
    const emiPlan = emiPlans.find(e => e.id === emiPlanId);
    
    if (fee && emiPlan) {
      const monthlyAmount = fee.amount / emiPlan.installments;
      const newApplication: FeeApplication = {
        id: `a${Date.now()}`,
        feeStructure: fee,
        emiPlan: { ...emiPlan, monthlyAmount },
        status: "pending",
        appliedAt: new Date().toISOString().split('T')[0],
      };
      
      setApplications(prev => [...prev, newApplication]);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Parent Dashboard</h1>
        <p className="text-gray-600">Welcome, {user?.name}</p>
        <div className="mt-2 p-2 bg-green-100 rounded">
          <p className="text-sm text-green-800">
            Role: Parent | Organization: {user?.organizationId || "Demo Institution"}
          </p>
        </div>
      </div>

      {/* Students Section */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Your Students</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {students.map((student) => (
            <div key={student.id} className="bg-white p-4 rounded-lg shadow border">
              <h3 className="font-medium text-lg">{student.name}</h3>
              <p className="text-sm text-gray-600">{student.rollNumber}</p>
              <p className="text-sm text-gray-600">{student.class} {student.section}</p>
              <p className="text-sm text-gray-600">{student.institution}</p>
              <Button
                size="sm"
                className="mt-2"
                onClick={() => setSelectedStudent(student)}
              >
                Manage Fees
              </Button>
            </div>
          ))}
        </div>
      </div>

      {/* Available Fees Section */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Available Fees for EMI</h2>
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fee Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Due Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    EMI Options
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {availableFees.map((fee) => (
                  <tr key={fee.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <p className="font-medium text-gray-900">{fee.name}</p>
                        <p className="text-sm text-gray-500">Academic Year: {fee.academicYear}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ₹{fee.amount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {fee.dueDate}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="space-x-2">
                        {emiPlans.map((plan) => (
                          <Button
                            key={plan.id}
                            size="sm"
                            variant="outline"
                            onClick={() => applyForEMI(fee.id, plan.id)}
                            className="mb-1"
                          >
                            {plan.name} (₹{(fee.amount / plan.installments).toLocaleString()}/month)
                          </Button>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Applications Section */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Your EMI Applications</h2>
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fee Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    EMI Plan
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Monthly Payment
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Applied Date
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {applications.map((application) => (
                  <tr key={application.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className="font-medium text-gray-900">{application.feeStructure.name}</p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ₹{application.feeStructure.amount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {application.emiPlan.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ₹{application.emiPlan.monthlyAmount.toLocaleString()}
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
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {application.appliedAt}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}