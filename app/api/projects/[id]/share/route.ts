import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { nanoid } from "nanoid";

const createShareLinkSchema = z.object({
  permissions: z.enum(["view", "comment"]).default("view"),
  expiresAt: z.string().optional(),
});

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const user = await requireAuth();
    const projectId = params.id;
    const body = await request.json();
    const { permissions, expiresAt } = createShareLinkSchema.parse(body);

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

    // Generate unique token
    const token = nanoid(32);

    const shareLink = await prisma.shareLink.create({
      data: {
        projectId,
        token,
        permissions,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
      },
    });

    const shareUrl = `${process.env.NEXT_PUBLIC_APP_URL}/p/${token}`;

    return NextResponse.json(
      {
        ...shareLink,
        shareUrl,
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    console.error("Error creating share link:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const user = await requireAuth();
    const projectId = params.id;

    // Check membership
    const membership = await prisma.projectMember.findFirst({
      where: {
        projectId,
        userId: user.id,
      },
    });

    if (!membership) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const shareLinks = await prisma.shareLink.findMany({
      where: {
        projectId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(shareLinks);
  } catch (error) {
    console.error("Error fetching share links:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

