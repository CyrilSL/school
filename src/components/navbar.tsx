import Link from "next/link";
import Image from "next/image";
import { Button } from "~/components/ui/button";
import { getServerSession } from "~/server/auth";
import SignoutButton from "~/components/auth/signout-button";

export default async function Navbar() {
  const session = await getServerSession();
  return (
    <nav className="bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <Image
              src="/logo.png"
              alt="MyFee Logo"
              width={32}
              height={32}
              className="h-8 w-8"
            />
            <div className="text-2xl font-bold text-blue-600">
              MyFee
            </div>
          </Link>

          {/* Navigation Links - Centered */}
          <div className="hidden md:flex items-center space-x-8 absolute left-1/2 transform -translate-x-1/2">
            <Link
              href="/"
              className="text-gray-600 hover:text-blue-600 transition-colors font-medium"
            >
              Home
            </Link>
            <Link
              href="#features"
              className="text-gray-600 hover:text-blue-600 transition-colors font-medium"
            >
              Features
            </Link>
            <Link
              href="#about"
              className="text-gray-600 hover:text-blue-600 transition-colors font-medium"
            >
              About
            </Link>
          </div>

          {/* Auth Buttons */}
          <div className="flex items-center space-x-3">
            {!session ? (
              <>
                <Link href="/login/parent">
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white font-medium"
                  >
                    Parent Login
                  </Button>
                </Link>
                <Link href="/login/institution">
                  <Button
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700 text-white font-medium"
                  >
                    Institution Login
                  </Button>
                </Link>
              </>
            ) : (
              <Link href={
                session.user?.email === "admin@school.edu" || session.user?.email?.includes("admin")
                  ? "/institution/dashboard"
                  : "/parent/dashboard"
              }>
                <Button
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Dashboard
                </Button>
              </Link>
            )}
          </div>

          {/* Mobile menu button - for future mobile menu implementation */}
          <div className="md:hidden">
            {/* Show Dashboard button for mobile too if authenticated */}
            {session && (
              <Link href={
                session.user?.email === "admin@school.edu" || session.user?.email?.includes("admin")
                  ? "/institution/dashboard"
                  : "/parent/dashboard"
              }>
                <Button
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Dashboard
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}