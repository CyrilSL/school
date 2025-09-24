"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { authClient } from "~/server/auth/client";

export default function ParentSignup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const result = await authClient.signUp.email({
        name,
        email,
        password,
      });

      if (result.error) {
        setError(result.error.message || "Signup failed");
      } else {
        // After successful signup, we'll need to add them to organization with parent role
        // For now, redirect to login
        router.push("/login/parent?signup=success");
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const fillDemoData = () => {
    setName("Parent User");
    setEmail("parent@example.com");
    setPassword("parent123");
  };

  return (
    <main className="min-h-screen bg-white">
      {/* Simple top bar for consistency with homepage */}
      <div className="bg-white/95 border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4 h-16 flex items-center">
          <Link href="/" className="text-2xl font-bold text-blue-600">MyFee</Link>
        </div>
      </div>

      <div className="container mx-auto px-4 py-10">
        <div className="mx-auto w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">Parent Sign Up</h2>
            <p className="text-gray-600 text-sm">
              Create your parent account to manage your child&apos;s educational fees
            </p>
          </div>

          {/* Demo Data Card */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h3 className="text-blue-700 font-medium mb-2">Demo Data</h3>
            <div className="text-sm text-blue-700 space-y-1">
              <p>Name: Parent User</p>
              <p>Email: parent@example.com</p>
              <p>Password: parent123</p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={fillDemoData}
              className="mt-3 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white"
            >
              Fill Demo Data
            </Button>
          </div>

          {/* Signup Form */}
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <form onSubmit={handleSignup} className="space-y-4">
              <div>
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1"
                  placeholder="Enter your full name"
                  required
                />
              </div>

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
                  minLength={8}
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
                {loading ? "Creating Account..." : "Sign Up as Parent"}
              </Button>
            </form>

            <div className="mt-4 text-center">
              <p className="text-gray-600 text-sm">
                Already have an account?{" "}
                <Link href="/login/parent" className="text-blue-600 hover:text-blue-700">
                  Sign in here
                </Link>
              </p>
            </div>

            <div className="mt-4 text-center">
              <p className="text-gray-600 text-sm">
                Institution admin?{" "}
                <Link href="/signup/institution" className="text-blue-600 hover:text-blue-700">
                  Sign up here
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
