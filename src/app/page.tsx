import Link from "next/link";
import { redirect } from "next/navigation";
import SignoutButton from "~/components/auth/signout-button";
import Navbar from "~/components/navbar";
import { getServerSession } from "~/server/auth";
import { isInstitutionAdmin, isParent } from "~/lib/roles";

export default async function Home() {
  const session = await getServerSession();

  // Redirect authenticated users to their appropriate dashboard
  if (session?.user) {
    // Mock role checking - in production, get from organization membership
    const userEmail = session.user.email;
    
    if (userEmail === "admin@school.edu") {
      redirect("/dashboard/institution");
    } else if (userEmail === "parent@example.com") {
      redirect("/dashboard/parent");
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-900 to-purple-900 text-white">
      <Navbar />
      <div className="flex min-h-screen flex-col items-center justify-center">
      <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16">
        <div className="text-center">
          <h1 className="text-5xl font-extrabold tracking-tight sm:text-[6rem] mb-4">
            <span className="text-blue-300">MyFee</span>
          </h1>
          <p className="text-xl text-gray-300 mb-8">
            Zero-Interest EMI Solutions for Educational Fees
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 max-w-4xl">
          <div className="flex flex-col gap-4 rounded-xl bg-white/10 p-6 backdrop-blur">
            <h3 className="text-2xl font-bold text-blue-300">For Institutions</h3>
            <div className="text-lg text-gray-200">
              Manage student fee applications, approve EMI plans, and track payments all in one place.
            </div>
            <div className="text-sm text-blue-200 bg-blue-900/20 p-3 rounded">
              <strong>Demo Signup:</strong><br/>
              Email: admin@school.edu<br/>
              Password: admin123
            </div>
          </div>
          
          <div className="flex flex-col gap-4 rounded-xl bg-white/10 p-6 backdrop-blur">
            <h3 className="text-2xl font-bold text-green-300">For Parents</h3>
            <div className="text-lg text-gray-200">
              Apply for zero-interest EMI plans for your child&apos;s educational expenses.
            </div>
            <div className="text-sm text-green-200 bg-green-900/20 p-3 rounded">
              <strong>Demo Signup:</strong><br/>
              Email: parent@example.com<br/>
              Password: parent123
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center gap-4">
          {!session ? (
            <div className="flex flex-col gap-4 sm:flex-row">
              <Link
                href="/signup/parent"
                className="rounded-full bg-green-600 hover:bg-green-700 px-8 py-3 font-semibold no-underline transition text-center"
              >
                Parent Signup
              </Link>
              <Link
                href="/signup/institution"
                className="rounded-full bg-blue-600 hover:bg-blue-700 px-8 py-3 font-semibold no-underline transition text-center"
              >
                Institution Signup
              </Link>
            </div>
          ) : (
            <div className="text-center">
              <p className="text-xl mb-4">Welcome back, {session.user?.name}!</p>
              <SignoutButton />
            </div>
          )}
        </div>

        <div className="text-center text-gray-400 text-sm max-w-2xl">
          <p>
            Experience our platform with the demo credentials above. Institution admins can manage fee applications 
            and approve EMI plans, while parents can apply for flexible payment options for their children&apos;s education.
          </p>
        </div>
      </div>
      </div>
    </main>
  );
}
