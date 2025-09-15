import Link from "next/link";
import { Button } from "~/components/ui/button";
import { getServerSession } from "~/server/auth";
import SignoutButton from "~/components/auth/signout-button";

export default async function Navbar() {
  const session = await getServerSession();
  return (
    <nav className="bg-gray-900/95 backdrop-blur-md border-b border-gray-700/50 shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="text-2xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
              MyFee
            </div>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            <Link 
              href="/" 
              className="text-gray-300 hover:text-yellow-400 transition-colors font-medium"
            >
              Home
            </Link>
            <Link 
              href="#features" 
              className="text-gray-300 hover:text-yellow-400 transition-colors font-medium"
            >
              Features
            </Link>
            <Link 
              href="#about" 
              className="text-gray-300 hover:text-yellow-400 transition-colors font-medium"
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
                    className="border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-gray-900 font-medium"
                  >
                    Parent Login
                  </Button>
                </Link>
                <Link href="/login/institution">
                  <Button 
                    size="sm"
                    className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-medium"
                  >
                    Institution Login
                  </Button>
                </Link>
              </>
            ) : (
              <>
                <div className="text-sm text-gray-300 mr-2">
                  Welcome, {session.user?.name}!
                </div>
                <Link href={
                  session.user?.email === "admin@school.edu" || session.user?.email?.includes("admin")
                    ? "/institution/dashboard"
                    : "/parent/dashboard"
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
                  ? "/institution/dashboard"
                  : "/parent/dashboard"
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