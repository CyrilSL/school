import { redirect } from "next/navigation";
import { getServerSession } from "~/server/auth";

export default async function SettingsPage() {
  const session = await getServerSession();

  if (!session?.user) {
    redirect("/login/parent");
  }

  return (
    <div className="max-w-4xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Settings</h1>
        <p className="text-gray-600">Manage your account settings</p>
      </div>

      <div className="bg-white p-6 rounded-lg border">
        <p className="text-gray-600">Settings page coming soon.</p>
      </div>
    </div>
  );
}