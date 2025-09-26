import { redirect } from "next/navigation";
import { getServerSession } from "~/server/auth";
import { db } from "~/server/db";
import { institution } from "~/server/db/schema";
import TabbedAdminDashboard from "~/components/admin/tabbed-admin-dashboard";

export default async function AdminDashboard() {
  const sessionData = await getServerSession();

  if (!sessionData?.session || !sessionData?.user) {
    redirect("/admin/signin");
  }

  const { session, user } = sessionData;

  if (user.role !== "admin") {
    redirect("/");
  }

  // Fetch institutions
  const institutions = await db.select().from(institution).orderBy(institution.createdAt);

  return <TabbedAdminDashboard institutions={institutions} />;
}