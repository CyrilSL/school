import { redirect } from "next/navigation";
import { getServerSession } from "~/server/auth";

export default async function ProfilePage() {
  const session = await getServerSession();

  if (!session?.user) {
    redirect("/login/parent");
  }

  return (
    <div className="max-w-4xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Profile</h1>
        <p className="text-gray-600">Manage your profile information</p>
      </div>

      <div className="bg-white p-6 rounded-lg border">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Name</label>
            <p className="mt-1 text-sm text-gray-900">{session.user?.name}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <p className="mt-1 text-sm text-gray-900">{session.user?.email}</p>
          </div>
        </div>
      </div>
    </div>
  );
}