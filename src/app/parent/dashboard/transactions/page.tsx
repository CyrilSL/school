import { redirect } from "next/navigation";
import { getServerSession } from "~/server/auth";
import { headers } from "next/headers";
import { Badge } from "~/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";

interface Transaction {
  id: string;
  applicationId: string;
  amount: number;
  status: string;
  date: string;
  description: string;
  paymentMethod: string;
}

export default async function TransactionHistory() {
  const session = await getServerSession();

  if (!session?.user) {
    redirect("/login/parent");
  }

  // Fetch real transactions from API
  let transactions: Transaction[] = [];

  try {
    const headersList = await headers();
    const host = headersList.get('host') || 'localhost:3000';
    const protocol = host.includes('localhost') ? 'http' : 'https';
    const cookie = headersList.get('cookie') || '';

    const transactionsResponse = await fetch(`${protocol}://${host}/api/parent/transactions`, {
      headers: {
        'Cookie': cookie,
      },
    });

    if (transactionsResponse.ok) {
      const data = await transactionsResponse.json();
      transactions = data.transactions || [];
    }
  } catch (error) {
    console.error('Error fetching transactions:', error);
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "overdue":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Transaction History</h1>
        <p className="text-gray-600">View all your payment transactions and EMI details</p>
      </div>

      {/* Transaction Cards */}
      <div className="space-y-4">
        {transactions.map((transaction) => (
          <Card key={transaction.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-4 mb-2">
                    <div className="text-sm text-gray-600">
                      {new Date(transaction.date).toLocaleDateString('en-IN', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </div>
                    <Badge className={getStatusColor(transaction.status)}>
                      {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                    </Badge>
                    <div className="text-sm text-gray-600">
                      ID: {transaction.id}
                    </div>
                  </div>

                  <div className="mb-2">
                    <h3 className="font-semibold text-lg">{transaction.description}</h3>
                  </div>

                  <div className="flex items-center space-x-6 text-sm text-gray-600">
                    <div>
                      <span>Application: </span>
                      <span className="font-medium">{transaction.applicationId}</span>
                    </div>
                    <div>
                      <span>Payment Method: </span>
                      <span className="font-medium">{transaction.paymentMethod}</span>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-900">
                    ₹{transaction.amount.toLocaleString()}
                  </div>
                  {transaction.status === "overdue" && (
                    <button className="mt-2 text-sm text-blue-600 hover:text-blue-800">
                      Retry Payment
                    </button>
                  )}
                  {transaction.status === "pending" && (
                    <button className="mt-2 text-sm text-orange-600 hover:text-orange-800">
                      View Details
                    </button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* If no transactions */}
      {transactions.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-500 mb-4">No transactions found</div>
          <p className="text-sm text-gray-400">
            Transactions will appear here once you start making payments
          </p>
        </div>
      )}

    </div>
  );
}