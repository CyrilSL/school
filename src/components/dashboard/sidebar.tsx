"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "~/lib/utils";
import { Button } from "~/components/ui/button";
import {
  Home,
  User,
  CreditCard,
  FileText,
  Settings,
  LogOut
} from "lucide-react";
import { useRouter } from "next/navigation";
import { authClient } from "~/server/auth/client";

const sidebarItems = [
  {
    title: "Dashboard",
    href: "/parent/dashboard",
    icon: Home,
  },
  {
    title: "Applications",
    href: "/parent/dashboard/applications",
    icon: FileText,
  },
  {
    title: "Installments",
    href: "/parent/dashboard/installments",
    icon: CreditCard,
  },
  {
    title: "Profile",
    href: "/parent/dashboard/profile",
    icon: User,
  },
  {
    title: "Settings",
    href: "/parent/dashboard/settings",
    icon: Settings,
  },
];

export default function DashboardSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await authClient.signOut({
        fetchOptions: {
          onSuccess: () => {
            router.push("/");
          },
        },
      });
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <div className="flex h-full w-64 flex-col bg-gray-50 border-r">
      <div className="flex h-16 items-center px-6 border-b">
        <h2 className="text-lg font-semibold">Parent Portal</h2>
      </div>

      <nav className="flex-1 space-y-2 p-4">
        {sidebarItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link key={item.href} href={item.href}>
              <Button
                variant={isActive ? "default" : "ghost"}
                className={cn(
                  "w-full justify-start",
                  isActive && "bg-blue-600 text-white hover:bg-blue-700"
                )}
              >
                <Icon className="mr-3 h-4 w-4" />
                {item.title}
              </Button>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t">
        <Button
          variant="ghost"
          className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
          onClick={handleLogout}
        >
          <LogOut className="mr-3 h-4 w-4" />
          Logout
        </Button>
      </div>
    </div>
  );
}