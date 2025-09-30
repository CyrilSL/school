import { NextRequest, NextResponse } from "next/server";
import { getServerSession, auth } from "~/server/auth";
import { db } from "~/server/db";
import { institution, organization, member } from "~/server/db/schema";
import { nanoid } from "nanoid";

export async function POST(request: NextRequest) {
  try {
    // Check if user is authenticated and is admin
    const sessionData = await getServerSession();

    if (!sessionData?.session || !sessionData?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (sessionData.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden - Admin access required" }, { status: 403 });
    }

    // Parse request body
    const body = await request.json();
    const { name, type, locations, boards, phone, email, website, isActive, adminEmail, adminPassword, adminName } = body;

    // Validate required fields
    if (!name || !type) {
      return NextResponse.json(
        { error: "Missing required fields: name, type" },
        { status: 400 }
      );
    }

    if (!locations || !Array.isArray(locations) || locations.length === 0) {
      return NextResponse.json(
        { error: "Missing required field: locations (must be array with at least one location)" },
        { status: 400 }
      );
    }

    if (!boards || !Array.isArray(boards) || boards.length === 0) {
      return NextResponse.json(
        { error: "Missing required field: boards (must be array with at least one board)" },
        { status: 400 }
      );
    }

    // Validate email format if provided
    if (email && !email.includes('@')) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    // Validate admin credentials if provided
    if (!adminEmail || !adminPassword || !adminName) {
      return NextResponse.json(
        { error: "Missing required admin credentials: adminEmail, adminPassword, adminName" },
        { status: 400 }
      );
    }

    if (!adminEmail.includes('@')) {
      return NextResponse.json(
        { error: "Invalid admin email format" },
        { status: 400 }
      );
    }

    if (adminPassword.length < 6) {
      return NextResponse.json(
        { error: "Admin password must be at least 6 characters long" },
        { status: 400 }
      );
    }

    // Create organization first (required by schema)
    const organizationId = nanoid();
    await db.insert(organization).values({
      id: organizationId,
      name: name,
      slug: name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
      createdAt: new Date(),
    });

    // Locations and boards are already in object format from the form

    // Create institution
    const institutionId = nanoid();
    const institutionData = {
      id: institutionId,
      organizationId: organizationId,
      name: name,
      type: type,
      locations: locations,
      boards: boards,
      phone: phone || null,
      email: email || null,
      website: website || null,
      isActive: isActive !== undefined ? isActive : true,
      createdAt: new Date(),
    };

    const newInstitution = await db.insert(institution).values(institutionData).returning();

    // Create admin user using Better Auth API
    const { data: newUser, error: userError } = await auth.api.signUpEmail({
      body: {
        name: adminName,
        email: adminEmail,
        password: adminPassword,
      }
    });

    // Note: Email verification is handled by Better Auth during signup

    if (userError) {
      console.error("Failed to create admin user:", userError);
      return NextResponse.json(
        { error: "Failed to create admin user: " + userError.message },
        { status: 500 }
      );
    }

    if (!newUser) {
      return NextResponse.json(
        { error: "Failed to create admin user: no user returned" },
        { status: 500 }
      );
    }

    console.log("Created new user via Better Auth:", newUser.email);

    // Add user as member of the organization with admin role
    await db.insert(member).values({
      id: nanoid(),
      organizationId: organizationId,
      userId: newUser.id,
      role: "admin",
      createdAt: new Date(),
    });

    return NextResponse.json({
      success: true,
      institution: newInstitution[0],
      adminUser: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
      },
      message: "Institution and admin login created successfully"
    });

  } catch (error) {
    console.error("Error creating institution:", error);
    return NextResponse.json(
      { error: "Failed to create institution" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Check if user is authenticated and is admin
    const sessionData = await getServerSession();

    if (!sessionData?.session || !sessionData?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (sessionData.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden - Admin access required" }, { status: 403 });
    }

    // Get all institutions
    const institutions = await db.select().from(institution).orderBy(institution.createdAt);

    return NextResponse.json({
      success: true,
      institutions: institutions
    });

  } catch (error) {
    console.error("Error fetching institutions:", error);
    return NextResponse.json(
      { error: "Failed to fetch institutions" },
      { status: 500 }
    );
  }
}