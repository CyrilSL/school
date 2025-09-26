import { redirect } from "next/navigation";
import { getServerSession } from "~/server/auth";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";

export default async function AdminDashboard() {
  const sessionData = await getServerSession();

  if (!sessionData?.session || !sessionData?.user) {
    redirect("/admin/signin");
  }

  const { session, user } = sessionData;

  if (user.role !== "admin") {
    redirect("/");
  }

  return (
    <main className="flex min-h-screen flex-col">
      <div className="container mx-auto flex flex-col gap-4 px-4 py-16">
        <div className="mb-8 flex flex-col gap-2">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome to the admin panel. Manage users and system settings.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Users</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">Coming Soon</p>
              <p className="text-sm text-muted-foreground">User management</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Applications</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">Coming Soon</p>
              <p className="text-sm text-muted-foreground">Fee applications</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">Coming Soon</p>
              <p className="text-sm text-muted-foreground">System settings</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Admin Info</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p><strong>Name:</strong> {user.name}</p>
              <p><strong>Email:</strong> {user.email}</p>
              <p><strong>Role:</strong> {user.role}</p>
              <p><strong>ID:</strong> {user.id}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}