"use client";

import Link from "next/link";

// Force dynamic rendering to avoid build issues with auth client
export const dynamic = 'force-dynamic';
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
  const [signupSuccess, setSignupSuccess] = useState(false);
  const [userEmail, setUserEmail] = useState("");
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
        // Show verification section instead of redirecting
        setSignupSuccess(true);
        setUserEmail(email);
        setError("");
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };


  const handleVerifyNow = async () => {
    setLoading(true);
    try {
      // For demo purposes, mark the user as verified
      const verifyResponse = await fetch("/api/auth/verify-demo", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: userEmail }),
      });

      if (!verifyResponse.ok) {
        throw new Error("Verification failed");
      }

      // Now try to sign in the verified user
      const result = await authClient.signIn.email({
        email: userEmail,
        password: password,
      });

      if (result.error) {
        setError("Sign in failed after verification. Please try again.");
      } else {
        // User is verified and signed in, redirect to dashboard
        router.push("/parent/dashboard");
      }
    } catch (err) {
      setError("Verification failed. Please try again.");
    } finally {
      setLoading(false);
    }
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
          {!signupSuccess ? (
            <>
              {/* Header */}
              <div className="text-center mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-2">Parent Sign Up</h2>
                <p className="text-gray-600 text-sm">
                  Create your parent account to manage your child&apos;s educational fees
                </p>
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
            </>
          ) : (
            // Verification Section
            <>
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-2">Account Created Successfully!</h2>
                <p className="text-gray-600 text-sm mb-4">
                  We&apos;ve sent a verification email to <strong>{userEmail}</strong>
                </p>
              </div>

              <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                  <div className="flex items-start space-x-3">
                    <svg className="w-5 h-5 text-yellow-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.876c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                    <div>
                      <h3 className="text-yellow-800 font-medium text-sm">Demo Mode - No Email Required</h3>
                      <p className="text-yellow-700 text-sm mt-1">
                        Since this is a demo, you can click &quot;Verify Now&quot; to simulate email verification and access your dashboard.
                      </p>
                    </div>
                  </div>
                </div>

                {error && (
                  <div className="text-red-700 text-sm bg-red-50 border border-red-200 rounded p-3 mb-4">
                    {error}
                  </div>
                )}

                <Button
                  onClick={handleVerifyNow}
                  disabled={loading}
                  className="w-full bg-green-600 hover:bg-green-700 text-white mb-4"
                >
                  {loading ? "Verifying..." : "Verify Now & Access Dashboard"}
                </Button>

                <div className="text-center">
                  <p className="text-gray-600 text-sm mb-2">
                    Didn&apos;t receive the email?
                  </p>
                  <button
                    onClick={() => {
                      setSignupSuccess(false);
                      setError("");
                    }}
                    className="text-blue-600 hover:text-blue-700 text-sm"
                  >
                    ← Back to sign up form
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
