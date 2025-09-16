import { SidebarTrigger } from "~/components/ui/sidebar";

export default function DashboardNavbar() {
  return (
    <nav className="border-b bg-white">
      <div className="flex h-16 items-center px-6">
        <div className="flex items-center space-x-4">
          <SidebarTrigger className="md:hidden" />
          <h1 className="text-xl font-semibold">MyFee</h1>
        </div>
      </div>
    </nav>
  );
}