import DashboardNavbar from "~/components/dashboard/navbar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardNavbar />
      <main className="p-6">
        {children}
      </main>
    </div>
  );
}