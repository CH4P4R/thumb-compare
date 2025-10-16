import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

const inviteSchema = z.object({
  email: z.string().email(),
  role: z.enum(["owner", "editor", "viewer"]),
});

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const user = await requireAuth();
    const projectId = params.id;
    const body = await request.json();
    const { email, role } = inviteSchema.parse(body);

    // Check if user is owner or editor
    const membership = await prisma.projectMember.findFirst({
      where: {
        projectId,
        userId: user.id,
        role: {
          in: ["owner", "editor"],
        },
      },
    });

    if (!membership) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Find the user to invite
    const invitedUser = await prisma.user.findUnique({
      where: { email },
    });

    if (!invitedUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if already a member
    const existingMember = await prisma.projectMember.findUnique({
      where: {
        projectId_userId: {
          projectId,
          userId: invitedUser.id,
        },
      },
    });

    if (existingMember) {
      return NextResponse.json({ error: "User already a member" }, { status: 400 });
    }

    // Create membership
    const newMember = await prisma.projectMember.create({
      data: {
        projectId,
        userId: invitedUser.id,
        role,
      },
      include: {
        user: true,
      },
    });

    return NextResponse.json(newMember, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    console.error("Error inviting user:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

