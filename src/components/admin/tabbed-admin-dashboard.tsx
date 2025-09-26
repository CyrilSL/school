"use client";

import { Building, MapPin } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import AdminDashboardClient from "./admin-dashboard-client";
import LocationManagement from "./location-management";

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

        <Tabs defaultValue="institutions" className="w-full">
          <TabsList className="grid w-full grid-cols-2 lg:w-[400px] mb-6">
            <TabsTrigger value="institutions" className="flex items-center space-x-2">
              <Building className="h-4 w-4" />
              <span>Institutions</span>
            </TabsTrigger>
            <TabsTrigger value="locations" className="flex items-center space-x-2">
              <MapPin className="h-4 w-4" />
              <span>Locations</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="institutions" className="space-y-4">
            <AdminDashboardClient institutions={institutions} />
          </TabsContent>

          <TabsContent value="locations" className="space-y-4">
            <LocationManagement />
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}