import { redirect } from "next/navigation";
import { getServerSession } from "~/server/auth";

export default async function AdminPage() {
  const sessionData = await getServerSession();

  if (!sessionData?.session || !sessionData?.user) {
    redirect("/admin/signin");
  }

  const { session, user } = sessionData;

  if (user.role !== "admin") {
    redirect("/");
  }

  // If user is admin, redirect to admin dashboard
  redirect("/admin/dashboard");
}