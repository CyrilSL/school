import DashboardNavbar from "~/components/dashboard/navbar";
import { getServerSession } from "~/server/auth";

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession();

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardNavbar userRole={session?.user?.role} />
      <main className="p-6">
        {children}
      </main>
    </div>
  );
}
