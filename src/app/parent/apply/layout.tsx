import { redirect } from "next/navigation";
import { getServerSession } from "~/server/auth";

export default async function ParentOnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession();

  if (!session?.user) {
    redirect("/login/parent");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {children}
    </div>
  );
}