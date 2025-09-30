import { redirect } from "next/navigation";
import { getServerSession } from "~/server/auth";
import { headers } from "next/headers";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Alert, AlertDescription } from "~/components/ui/alert";
import {
  CreditCard,
  FileText,
  IndianRupee,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Calendar,
  Receipt,
  HelpCircle,
} from "lucide-react";

interface FeeApplication {
  id: string;
  institution: string;
  academicYear: string;
  studentName: string;
  totalFees: number;
  status: string;
  statusText: string;
  actionText: string;
  actionUrl: string;
  appliedAt?: string;
  emiPlan?: {
    name: string;
    installments: number;
    monthlyAmount: number;
    interestRate: number;
  } | null;
}

export default async function ParentDashboard() {
  // Server-side authentication check (same as homepage)
  const session = await getServerSession();

  if (!session?.user) {
    redirect("/login/parent");
  }

  // Fetch real applications from API
  let applications: FeeApplication[] = [];
  let isOnboardingCompleted = false;

  try {
    const headersList = await headers();
    const host = headersList.get('host') || 'localhost:3000';
    const protocol = host.includes('localhost') ? 'http' : 'https';
    const cookie = headersList.get('cookie') || '';

    const applicationsResponse = await fetch(`${protocol}://${host}/api/parent/applications`, {
      headers: {
        'Cookie': cookie,
      },
    });

    if (applicationsResponse.ok) {
      const data = await applicationsResponse.json();
      applications = data.applications || [];
      isOnboardingCompleted = data.isOnboardingCompleted || false;
    }
  } catch (error) {
    console.error('Error fetching applications:', error);
  }

  // If no applications exist, redirect to onboarding
  if (applications.length === 0) {
    redirect("/parent/apply");
  }

  // Calculate statistics
  const totalApplications = applications.length;
  const activeApplications = applications.filter(app =>
    app.status !== 'completed' && app.status !== 'rejected'
  ).length;
  const totalFeeAmount = applications.reduce((sum, app) => sum + app.totalFees, 0);
  const pendingActions = applications.filter(app =>
    app.status === 'emi_pending' || app.status === 'onboarding_pending'
  ).length;

  // Fetch real upcoming payments (EMI installments)
  let upcomingPayments: { date: string; amount: number; institution: string; status: string; applicationId: string }[] = [];

  // Get pending installments for the first application (or all applications)
  if (applications.length > 0) {
    try {
      const headersList = await headers();
      const host = headersList.get('host') || 'localhost:3000';
      const protocol = host.includes('localhost') ? 'http' : 'https';
      const cookie = headersList.get('cookie') || '';

      // Fetch installments for all applications
      for (const app of applications.slice(0, 2)) { // Get first 2 apps to show upcoming payments
        const installmentsResponse = await fetch(
          `${protocol}://${host}/api/parent/payment/emi?feeApplicationId=${app.id}`,
          { headers: { 'Cookie': cookie } }
        );

        if (installmentsResponse.ok) {
          const data = await installmentsResponse.json();
          const pendingInstallments = (data.installments || [])
            .filter((inst: any) => inst.status === 'pending')
            .slice(0, 2) // Get first 2 pending installments
            .map((inst: any) => ({
              date: new Date(inst.dueDate).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }),
              amount: parseFloat(inst.amount),
              institution: app.institution,
              status: new Date(inst.dueDate) < new Date() ? 'overdue' : 'upcoming',
              applicationId: app.id,
            }));
          upcomingPayments.push(...pendingInstallments);
        }
      }
    } catch (error) {
      console.error('Error fetching upcoming payments:', error);
    }
  }

  // Fetch real recent transactions
  let recentTransactions: { id: string; date: string; amount: number; type: string; status: string }[] = [];
  try {
    const headersList = await headers();
    const host = headersList.get('host') || 'localhost:3000';
    const protocol = host.includes('localhost') ? 'http' : 'https';
    const cookie = headersList.get('cookie') || '';

    const transactionsResponse = await fetch(`${protocol}://${host}/api/parent/transactions`, {
      headers: { 'Cookie': cookie },
    });

    if (transactionsResponse.ok) {
      const data = await transactionsResponse.json();
      recentTransactions = (data.transactions || [])
        .filter((txn: any) => txn.status === 'paid')
        .slice(0, 2) // Get last 2 completed payments
        .map((txn: any) => ({
          id: txn.id,
          date: new Date(txn.date).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }),
          amount: txn.amount,
          type: txn.description,
          status: 'completed',
        }));
    }
  } catch (error) {
    console.error('Error fetching recent transactions:', error);
  }

  return (
    <div className="w-full max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600 mt-1">Welcome back, {session.user.name || "Parent"}</p>
          </div>
          <Button asChild className="bg-blue-600 hover:bg-blue-700 text-white">
            <a href="/parent/apply">+ New Application</a>
          </Button>
        </div>
      </div>

      {/* Action Required Alert */}
      {pendingActions > 0 && (
        <Alert className="mb-6 border-orange-200 bg-orange-50">
          <AlertCircle className="h-4 w-4 text-orange-600" />
          <AlertDescription className="text-orange-800">
            You have {pendingActions} application{pendingActions > 1 ? 's' : ''} requiring your attention. Please complete the pending actions.
          </AlertDescription>
        </Alert>
      )}

      {/* Statistics Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card className="border-l-4 border-l-blue-600">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Applications</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{totalApplications}</p>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-600">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Applications</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{activeApplications}</p>
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-600">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Fee Amount</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">₹{(totalFeeAmount / 100000).toFixed(1)}L</p>
              </div>
              <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <IndianRupee className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-600">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Actions</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{pendingActions}</p>
              </div>
              <div className="h-12 w-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <Clock className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3 mb-8">
        {/* Upcoming Payments */}
        <Card className="lg:col-span-2">
          <CardHeader className="border-b bg-gray-50">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <Calendar className="h-5 w-5 text-blue-600" />
                Upcoming Payments
              </CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <a href="/parent/dashboard/installments" className="text-blue-600 hover:text-blue-700">
                  View All <ArrowRight className="h-4 w-4 ml-1" />
                </a>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              {upcomingPayments.map((payment, index) => (
                <div key={index} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <CreditCard className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{payment.institution}</p>
                      <p className="text-sm text-gray-600">Due: {payment.date}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">₹{payment.amount.toLocaleString()}</p>
                    <Badge variant="outline" className="text-xs">
                      {payment.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader className="border-b bg-gray-50">
            <CardTitle className="text-lg font-semibold">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-3">
              <Button variant="outline" className="w-full justify-start" asChild>
                <a href="/parent/dashboard/transactions">
                  <Receipt className="h-4 w-4 mr-2" />
                  View Transactions
                </a>
              </Button>
              <Button variant="outline" className="w-full justify-start" asChild>
                <a href={`/parent/dashboard/installments?applicationId=${applications[0]?.id || ""}`}>
                  <Calendar className="h-4 w-4 mr-2" />
                  EMI Schedule
                </a>
              </Button>
              <Button variant="outline" className="w-full justify-start" asChild>
                <a href="/parent/apply">
                  <FileText className="h-4 w-4 mr-2" />
                  New Application
                </a>
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <HelpCircle className="h-4 w-4 mr-2" />
                Help & Support
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions */}
      <Card className="mb-8">
        <CardHeader className="border-b bg-gray-50">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Receipt className="h-5 w-5 text-blue-600" />
              Recent Transactions
            </CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <a href="/parent/dashboard/transactions" className="text-blue-600 hover:text-blue-700">
                View All <ArrowRight className="h-4 w-4 ml-1" />
              </a>
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y">
            {recentTransactions.map((transaction) => (
              <div key={transaction.id} className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{transaction.type}</p>
                    <p className="text-sm text-gray-600">ID: {transaction.id} • {transaction.date}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">₹{transaction.amount.toLocaleString()}</p>
                  <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                    {transaction.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Applications Section */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-1">Your Applications</h2>
        <p className="text-gray-600">Manage and track all your fee applications</p>
      </div>

      {/* Application Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {applications.map((application) => (
          <Card key={application.id} className="hover:shadow-lg transition-shadow border-t-4 border-t-blue-600">
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="text-xs text-gray-500 mb-1">ID: {application.id}</div>
                  <CardTitle className="text-lg leading-tight text-gray-900">{application.institution}</CardTitle>
                </div>
                <Badge
                  variant={
                    application.status === "emi_pending" || application.status === "onboarding_pending"
                      ? "destructive"
                      : application.status === "completed"
                      ? "default"
                      : "secondary"
                  }
                  className="ml-2 shrink-0"
                >
                  {application.status === "emi_pending" || application.status === "onboarding_pending"
                    ? "Action Required"
                    : application.status === "completed"
                    ? "Completed"
                    : "In Progress"}
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="text-xs text-gray-600 mb-1">Academic Year</div>
                  <div className="font-medium text-sm text-gray-900">{application.academicYear}</div>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="text-xs text-gray-600 mb-1">Student Name</div>
                  <div className="font-medium text-sm text-gray-900">{application.studentName}</div>
                </div>
              </div>

              <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                <div className="text-xs text-gray-600 mb-1">Total Fee Amount</div>
                <div className="text-2xl font-bold text-blue-600">
                  ₹{application.totalFees.toLocaleString()}
                </div>
              </div>

              <div className="text-sm text-gray-700 pt-2">{application.statusText}</div>
            </CardContent>

            <div className="p-6 pt-0">
              <Button
                asChild
                className={`w-full text-white ${
                  application.status === "emi_pending" || application.status === "onboarding_pending"
                    ? "bg-orange-600 hover:bg-orange-700"
                    : application.status === "completed"
                    ? "bg-blue-600 hover:bg-blue-700"
                    : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                <a href={application.actionUrl}>
                  {application.actionText}
                  <ArrowRight className="h-4 w-4 ml-2" />
                </a>
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* Help Section */}
      <Card className="mt-8 bg-blue-50 border-blue-200">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="h-12 w-12 bg-blue-600 rounded-lg flex items-center justify-center shrink-0">
              <HelpCircle className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 mb-1">Need Help?</h3>
              <p className="text-sm text-gray-700 mb-3">
                Our support team is available 24/7 to assist you with any questions about your applications or EMI payments.
              </p>
              <div className="flex gap-3">
                <Button variant="outline" size="sm" className="bg-white">
                  Contact Support
                </Button>
                <Button variant="outline" size="sm" className="bg-white">
                  View FAQs
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

    </div>
  );
}