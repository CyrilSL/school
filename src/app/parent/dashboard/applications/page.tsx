import { redirect } from "next/navigation";
import { getServerSession } from "~/server/auth";

export default async function ApplicationsPage() {
  const session = await getServerSession();

  if (!session?.user) {
    redirect("/login/parent");
  }

  return (
    <div className="max-w-4xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Applications</h1>
        <p className="text-gray-600">View and manage your EMI applications</p>
      </div>

      <div className="bg-white p-6 rounded-lg border">
        <p className="text-gray-600">No applications found.</p>
      </div>
    </div>
  );
}