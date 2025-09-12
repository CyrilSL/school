import Navbar from "~/components/navbar";
import SignoutButton from "~/components/auth/signout-button";
import { getServerSession } from "~/server/auth";
import { HeroClient } from "~/components/landing/hero-client";
import { FeaturesClient } from "~/components/landing/features-client";

export default async function Home() {
  const session = await getServerSession();

  return (
    <main className="min-h-screen bg-white">
      <Navbar />
      <HeroClient />
      <FeaturesClient />
      
      {session && (
        <section className="py-16 bg-gradient-to-r from-blue-50 to-purple-50">
          <div className="container mx-auto text-center px-4">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Welcome back, {session.user?.name}!
            </h2>
            <p className="text-gray-600 mb-8">
              Ready to continue managing your educational finance?
            </p>
            <SignoutButton />
          </div>
        </section>
      )}
    </main>
  );
}