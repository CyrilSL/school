import { NextRequest, NextResponse } from "next/server";
import { db } from "~/server/db";
import { institution, organization, member } from "~/server/db/schema";
import { getServerSession } from "~/server/auth";
import { eq, and } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    console.log("🟢 Institution Details API: Starting request");
    const session = await getServerSession();

    if (!session?.user) {
      console.log("🔴 Institution Details API: No session or user");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("🟢 Institution Details API: User found:", session.user.id);

    // Get user's organization membership
    const userMembership = await db.query.member.findFirst({
      where: eq(member.userId, session.user.id),
      with: {
        organization: true,
      },
    });

    console.log("🟢 Institution Details API: User membership query result:", userMembership);

    if (!userMembership) {
      console.log("🔴 Institution Details API: No membership found for user");
      return NextResponse.json({ error: "User not associated with any organization" }, { status: 404 });
    }

    console.log("🟢 Institution Details API: Organization ID:", userMembership.organizationId);

    // Get institution details for this organization
    const institutionDetails = await db.query.institution.findFirst({
      where: eq(institution.organizationId, userMembership.organizationId),
    });

    console.log("🟢 Institution Details API: Institution query result:", institutionDetails);

    if (!institutionDetails) {
      console.log("🔴 Institution Details API: No institution found for organization");
      return NextResponse.json({ error: "Institution not found" }, { status: 404 });
    }

    console.log("🟢 Institution Details API: Returning success response");
    return NextResponse.json({
      institution: institutionDetails,
      organization: userMembership.organization,
    });
  } catch (error) {
    console.error("🔴 Institution Details API: Error fetching institution details:", error);
    return NextResponse.json({
      error: "Internal server error"
    }, { status: 500 });
  }
}