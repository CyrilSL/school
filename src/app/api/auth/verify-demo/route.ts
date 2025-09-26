import { NextRequest, NextResponse } from "next/server";
import { db } from "~/server/db";
import { user } from "~/server/db/schema";
import { eq } from "drizzle-orm";

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // For demo purposes, mark the user as verified
    // In a real app, you'd verify the token from the email
    const result = await db
      .update(user)
      .set({ emailVerified: true })
      .where(eq(user.email, email))
      .returning();

    if (result.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Email verified successfully" });
  } catch (error) {
    console.error("Demo verification error:", error);
    return NextResponse.json(
      { error: "Verification failed" },
      { status: 500 }
    );
  }
}