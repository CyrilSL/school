"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { authClient } from "~/server/auth/client";

export default function InstitutionSignup() {
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
        // After successful signup, we'll need to add them to organization with admin role
        // For now, redirect to login
        router.push("/login/institution?signup=success");
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const fillDemoData = () => {
    setName("Institution Admin");
    setEmail("admin@school.edu");
    setPassword("admin123");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-900 to-purple-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <h1 className="text-3xl font-bold text-blue-300 mb-2">MyFee</h1>
          </Link>
          <h2 className="text-xl text-white mb-2">Institution Sign Up</h2>
          <p className="text-gray-300 text-sm">
            Create your admin account to manage student fees and EMI applications
          </p>
        </div>

        {/* Demo Data Card */}
        <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4 mb-6">
          <h3 className="text-blue-300 font-medium mb-2">Demo Data</h3>
          <div className="text-sm text-blue-200 space-y-1">
            <p>Name: Institution Admin</p>
            <p>Email: admin@school.edu</p>
            <p>Password: admin123</p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={fillDemoData}
            className="mt-3 border-blue-400 text-blue-400 hover:bg-blue-400 hover:text-white"
          >
            Fill Demo Data
          </Button>
        </div>

        {/* Signup Form */}
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
          <form onSubmit={handleSignup} className="space-y-4">
            <div>
              <Label htmlFor="name" className="text-white">Full Name</Label>
              <Input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 bg-white/10 border-white/20 text-white placeholder-gray-300"
                placeholder="Enter your full name"
                required
              />
            </div>

            <div>
              <Label htmlFor="email" className="text-white">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 bg-white/10 border-white/20 text-white placeholder-gray-300"
                placeholder="Enter your email"
                required
              />
            </div>

            <div>
              <Label htmlFor="password" className="text-white">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 bg-white/10 border-white/20 text-white placeholder-gray-300"
                placeholder="Enter your password"
                required
                minLength={8}
              />
            </div>

            {error && (
              <div className="text-red-400 text-sm bg-red-900/20 border border-red-500/30 rounded p-3">
                {error}
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            >
              {loading ? "Creating Account..." : "Sign Up as Institution Admin"}
            </Button>
          </form>

          <div className="mt-4 text-center">
            <p className="text-gray-300 text-sm">
              Already have an account?{" "}
              <Link href="/login/institution" className="text-blue-300 hover:text-blue-200">
                Sign in here
              </Link>
            </p>
          </div>

          <div className="mt-4 text-center">
            <p className="text-gray-300 text-sm">
              Parent?{" "}
              <Link href="/signup/parent" className="text-green-300 hover:text-green-200">
                Sign up here
              </Link>
            </p>
          </div>

          <div className="mt-4 text-center">
            <Link href="/" className="text-gray-400 hover:text-gray-300 text-sm">
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}