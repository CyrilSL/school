"use client";

import Link from "next/link";
import { Button } from "~/components/ui/button";

export default function Navbar() {
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
            <Link href="/signup/parent">
              <Button 
                variant="outline" 
                size="sm"
                className="border-green-400 text-green-400 hover:bg-green-400 hover:text-white"
              >
                Parent Signup
              </Button>
            </Link>
            <Link href="/signup/institution">
              <Button 
                size="sm"
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Institution Signup
              </Button>
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button variant="ghost" size="sm">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}