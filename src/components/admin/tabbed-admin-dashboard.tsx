"use client";

import AdminDashboardClient from "./admin-dashboard-client";

interface Institution {
  id: string;
  name: string;
  type: string;
  city: string;
  state: string | null;
  board: string | null;
  address: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date | null;
  organizationId: string;
}

interface TabbedAdminDashboardProps {
  institutions: Institution[];
}

export default function TabbedAdminDashboard({ institutions }: TabbedAdminDashboardProps) {
  return (
    <main className="flex min-h-screen flex-col">
      <div className="container mx-auto flex flex-col gap-4 px-4 py-16">
        <div className="mb-8 flex flex-col gap-2">
          <div>
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-muted-foreground">
              Welcome to the admin panel. Manage institutions and system settings.
            </p>
          </div>
        </div>

        <AdminDashboardClient institutions={institutions} />
      </div>
    </main>
  );
}