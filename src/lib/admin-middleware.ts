import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "~/server/auth";

export async function requireAdmin() {
  const { session, user } = await getServerSession();

  if (!session || !user) {
    return NextResponse.redirect(new URL("/login", process.env.NEXTAUTH_URL || "http://localhost:3000"));
  }

  if (user.role !== "admin") {
    return NextResponse.redirect(new URL("/", process.env.NEXTAUTH_URL || "http://localhost:3000"));
  }

  return { session, user };
}

export async function isAdmin() {
  const { session, user } = await getServerSession();
  return session && user && user.role === "admin";
}