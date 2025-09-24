"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { authClient } from "~/server/auth/client";

export default function ParentLogin() {
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
      } else {
        router.push("/parent/dashboard");
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const fillDemoCredentials = () => {
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
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">Parent Login</h2>
            <p className="text-gray-600 text-sm">
              Access your dashboard to manage your child&apos;s educational fees
            </p>
          </div>

          {/* Demo Credentials Card */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h3 className="text-blue-700 font-medium mb-2">Demo Credentials</h3>
            <div className="text-sm text-blue-700 space-y-1">
              <p>Email: parent@example.com</p>
              <p>Password: parent123</p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={fillDemoCredentials}
              className="mt-3 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white"
            >
              Use Demo Credentials
            </Button>
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
                {loading ? "Signing in..." : "Sign in as Parent"}
              </Button>
            </form>

            <div className="mt-4 text-center">
              <p className="text-gray-600 text-sm">
                Institution admin?{" "}
                <Link href="/login/institution" className="text-blue-600 hover:text-blue-700">
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
