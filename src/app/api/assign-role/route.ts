import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "~/server/db";
import { organization, member, institution, student } from "~/server/db/schema";
import { ROLES } from "~/lib/roles";

export async function POST(request: Request) {
  try {
    const { userId, email, role } = await request.json();

    if (!userId || !email || !role) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Check if organization exists, create if not
    let demoOrg = await db
      .select()
      .from(organization)
      .where(eq(organization.slug, "demo-institution"))
      .limit(1);

    if (demoOrg.length === 0) {
      [demoOrg[0]] = await db
        .insert(organization)
        .values({
          id: `org-${Date.now()}`,
          name: "Demo Educational Institution",
          slug: "demo-institution",
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning();
    }

    // Add user to organization with specified role
    await db.insert(member).values({
      id: `member-${userId}-${Date.now()}`,
      organizationId: demoOrg[0]!.id,
      userId: userId,
      role: role,
      createdAt: new Date(),
    });

    // If it's a parent, create demo student and institution
    if (role === ROLES.PARENT && email === "parent@example.com") {
      // Check if institution exists, create if not
      let inst = await db
        .select()
        .from(institution)
        .where(eq(institution.organizationId, demoOrg[0]!.id))
        .limit(1);

      if (inst.length === 0) {
        [inst[0]] = await db
          .insert(institution)
          .values({
            id: `inst-${Date.now()}`,
            organizationId: demoOrg[0]!.id,
            name: "Demo Public School",
            type: "school",
            address: "123 Education Street, Learning City",
            phone: "+1-555-0123",
            email: "info@demoschool.edu",
            createdAt: new Date(),
            updatedAt: new Date(),
          })
          .returning();
      }

      // Create demo student for this parent
      await db.insert(student).values({
        id: `student-${userId}-${Date.now()}`,
        parentId: userId,
        institutionId: inst[0]!.id,
        name: "Alex Johnson",
        rollNumber: "2024001",
        class: "Class 10",
        section: "A",
        admissionDate: new Date("2024-01-15"),
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error assigning role:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}