import Link from "next/link";
import { Button } from "~/components/ui/button";
import { getServerSession } from "~/server/auth";
import SignoutButton from "~/components/auth/signout-button";

export default async function Navbar() {
  const session = await getServerSession();
  return (
    <nav className="bg-white/10 backdrop-blur-sm border-b border-white/20">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="text-2xl font-bold text-blue-300">
              MyFee
            </div>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            <Link 
              href="/" 
              className="text-gray-200 hover:text-white transition-colors"
            >
              Home
            </Link>
            <Link 
              href="#features" 
              className="text-gray-200 hover:text-white transition-colors"
            >
              Features
            </Link>
            <Link 
              href="#about" 
              className="text-gray-200 hover:text-white transition-colors"
            >
              About
            </Link>
          </div>

          {/* Auth Buttons */}
          <div className="flex items-center space-x-2">
            {!session ? (
              <>
                <Link href="/login/parent">
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="border-green-400 text-green-400 hover:bg-green-400 hover:text-white"
                  >
                    Parent Login
                  </Button>
                </Link>
                <Link href="/login/institution">
                  <Button 
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    Institution Login
                  </Button>
                </Link>
              </>
            ) : (
              <>
                <div className="text-sm text-gray-200 mr-2">
                  Welcome, {session.user?.name}!
                </div>
                <Link href={
                  session.user?.email === "admin@school.edu" || session.user?.email?.includes("admin") 
                    ? "/dashboard/institution" 
                    : "/dashboard/parent"
                }>
                  <Button 
                    size="sm"
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    Dashboard
                  </Button>
                </Link>
                <SignoutButton />
              </>
            )}
          </div>

          {/* Mobile menu button - for future mobile menu implementation */}
          <div className="md:hidden">
            {/* Show Dashboard button for mobile too if authenticated */}
            {session && (
              <Link href={
                session.user?.email === "admin@school.edu" || session.user?.email?.includes("admin") 
                  ? "/dashboard/institution" 
                  : "/dashboard/parent"
              }>
                <Button 
                  size="sm"
                  className="bg-green-600 hover:bg-green-700 text-white"
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