import { NextRequest, NextResponse } from "next/server";
import { getServerSession, auth } from "~/server/auth";
import { db } from "~/server/db";
import { institution, user, account, member } from "~/server/db/schema";
import { eq, and } from "drizzle-orm";
import { nanoid } from "nanoid";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Await params first (Next.js 15 requirement)
    const { id } = await params;

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
    if (adminEmail || adminPassword || adminName) {
      if (!adminEmail || !adminEmail.includes('@')) {
        return NextResponse.json(
          { error: "Invalid admin email format" },
          { status: 400 }
        );
      }

      if (!adminPassword || adminPassword.length < 6) {
        return NextResponse.json(
          { error: "Admin password must be at least 6 characters long" },
          { status: 400 }
        );
      }

      if (!adminName) {
        return NextResponse.json(
          { error: "Admin name is required" },
          { status: 400 }
        );
      }
    }

    // Check if institution exists
    const existingInstitution = await db.select().from(institution).where(eq(institution.id, id));

    if (existingInstitution.length === 0) {
      return NextResponse.json(
        { error: "Institution not found" },
        { status: 404 }
      );
    }

    // Prepare update data - locations and boards are already in object format from the form
    const updateData = {
      name: name,
      type: type,
      locations: locations,
      boards: boards,
      phone: phone || null,
      email: email || null,
      website: website || null,
      isActive: isActive !== undefined ? isActive : true,
      updatedAt: new Date(),
    };

    // Update institution
    const updatedInstitution = await db.update(institution)
      .set(updateData)
      .where(eq(institution.id, id))
      .returning();

    let adminUserInfo = null;

    // Handle admin credentials update if provided
    if (adminEmail && adminPassword && adminName) {
      const inst = existingInstitution[0];
      const organizationId = inst!.organizationId;

      // Check if an admin user already exists for this organization
      const existingMembers = await db.select({
        userId: member.userId,
        userName: user.name,
        userEmail: user.email,
      })
      .from(member)
      .innerJoin(user, eq(member.userId, user.id))
      .where(eq(member.organizationId, organizationId));

      if (existingMembers.length > 0) {
        // Update existing admin user
        const existingMember = existingMembers[0]!;
        console.log(`Updating credentials for user: ${existingMember.userEmail} (ID: ${existingMember.userId})`);

        // Delete the existing user to recreate with new credentials
        // First delete the member relationship
        await db.delete(member)
          .where(and(
            eq(member.organizationId, organizationId),
            eq(member.userId, existingMember.userId)
          ));

        // Delete user accounts
        await db.delete(account)
          .where(eq(account.userId, existingMember.userId));

        // Delete the user
        await db.delete(user)
          .where(eq(user.id, existingMember.userId));

        console.log("Deleted existing user and accounts");

        // Create new user with Better Auth
        const { data: newUser, error: userError } = await auth.api.signUpEmail({
          body: {
            name: adminName,
            email: adminEmail,
            password: adminPassword,
          }
        });

        // Auto-verify the email for admin-created users
        if (newUser && !userError) {
          try {
            await fetch(`${process.env.BETTER_AUTH_URL}/api/auth/verify-demo`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ email: adminEmail })
            });
            console.log("Auto-verified updated admin user email:", adminEmail);
          } catch (verifyError) {
            console.warn("Failed to auto-verify admin email:", verifyError);
          }
        }

        if (userError) {
          console.error("Failed to create new admin user:", userError);
          return NextResponse.json(
            { error: "Failed to update admin user: " + userError.message },
            { status: 500 }
          );
        }

        if (!newUser) {
          return NextResponse.json(
            { error: "Failed to create new admin user: no user returned" },
            { status: 500 }
          );
        }

        // Add new user as member of the organization
        await db.insert(member).values({
          id: nanoid(),
          organizationId: organizationId,
          userId: newUser.id,
          role: "admin",
          createdAt: new Date(),
        });

        console.log("Created new user via Better Auth:", newUser.email);

        adminUserInfo = {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          action: "updated"
        };
      } else {
        // Create new admin user using Better Auth
        const { data: newUser, error: userError } = await auth.api.signUpEmail({
          body: {
            name: adminName,
            email: adminEmail,
            password: adminPassword,
          }
        });

        // Auto-verify the email for admin-created users
        if (newUser && !userError) {
          try {
            await fetch(`${process.env.BETTER_AUTH_URL}/api/auth/verify-demo`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ email: adminEmail })
            });
            console.log("Auto-verified new admin user email:", adminEmail);
          } catch (verifyError) {
            console.warn("Failed to auto-verify admin email:", verifyError);
          }
        }

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

        // Add user as member of the organization
        await db.insert(member).values({
          id: nanoid(),
          organizationId: organizationId,
          userId: newUser.id,
          role: "admin",
          createdAt: new Date(),
        });

        adminUserInfo = {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          action: "created"
        };
      }
    }

    return NextResponse.json({
      success: true,
      institution: updatedInstitution[0],
      adminUser: adminUserInfo,
      message: adminUserInfo ?
        `Institution updated and admin login ${adminUserInfo.action} successfully` :
        "Institution updated successfully"
    });

  } catch (error) {
    console.error("Error updating institution:", error);
    return NextResponse.json(
      { error: "Failed to update institution" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Await params first (Next.js 15 requirement)
    const { id } = await params;

    // Check if user is authenticated and is admin
    const sessionData = await getServerSession();

    if (!sessionData?.session || !sessionData?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (sessionData.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden - Admin access required" }, { status: 403 });
    }

    // Check if institution exists
    const existingInstitution = await db.select().from(institution).where(eq(institution.id, id));

    if (existingInstitution.length === 0) {
      return NextResponse.json(
        { error: "Institution not found" },
        { status: 404 }
      );
    }

    // Delete institution
    await db.delete(institution).where(eq(institution.id, id));

    return NextResponse.json({
      success: true,
      message: "Institution deleted successfully"
    });

  } catch (error) {
    console.error("Error deleting institution:", error);
    return NextResponse.json(
      { error: "Failed to delete institution" },
      { status: 500 }
    );
  }
}