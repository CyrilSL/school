"use client";

// Force dynamic rendering to avoid build issues with auth client
export const dynamic = 'force-dynamic';

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { authClient } from "~/server/auth/client";

export default function InstitutionLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const result = await authClient.signIn.email({
        email,
        password,
      });

      if (result.error) {
        setError(result.error.message || "Login failed");
        return;
      }

      // Verify this user has organization membership (institution admin)
      const session = await authClient.getSession();

      if (session.data?.user.role === "admin") {
        setError("Admin users should login via /admin/signin");
        await authClient.signOut();
        return;
      }

      // Check for organization membership
      try {
        const orgResponse = await fetch("/api/auth/organization/get-active-member", {
          credentials: "include"
        });

        if (!orgResponse.ok) {
          setError("This account is not associated with any institution. Institution admins only.");
          await authClient.signOut();
          return;
        }

        const orgData = await orgResponse.json();
        if (!orgData) {
          setError("This account is not associated with any institution. Institution admins only.");
          await authClient.signOut();
          return;
        }
      } catch (err) {
        setError("This account is not associated with any institution. Institution admins only.");
        await authClient.signOut();
        return;
      }

      // Success - user is an institution admin
      router.push("/institution/dashboard");
      router.refresh();
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };


  return (
    <main className="min-h-screen bg-white">
      {/* Simple top bar for consistency with homepage */}
      <div className="bg-white/95 border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4 h-16 flex items-center">
          <Link href="/" className="flex items-center space-x-2">
            <Image
              src="/logo.png"
              alt="MyFee Logo"
              width={32}
              height={32}
              className="h-8 w-8"
            />
            <span className="text-2xl font-bold text-blue-600">MyFee</span>
          </Link>
        </div>
      </div>

      <div className="container mx-auto px-4 py-10">
        <div className="mx-auto w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">Institution Login</h2>
            <p className="text-gray-600 text-sm">
              Access your admin dashboard to manage student fees and EMI applications
            </p>
          </div>


          {/* Login Form */}
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1"
                  placeholder="Enter your email"
                  required
                />
              </div>

              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-1"
                  placeholder="Enter your password"
                  required
                />
              </div>

              {error && (
                <div className="text-red-700 text-sm bg-red-50 border border-red-200 rounded p-3">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              >
                {loading ? "Signing in..." : "Sign in as Institution Admin"}
              </Button>
            </form>

            <div className="mt-4 text-center">
              <p className="text-gray-600 text-sm">
                Parent?{" "}
                <Link href="/login/parent" className="text-blue-600 hover:text-blue-700">
                  Login here
                </Link>
              </p>
            </div>

            <div className="mt-4 text-center">
              <Link href="/" className="text-gray-500 hover:text-gray-700 text-sm">
                ← Back to Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
