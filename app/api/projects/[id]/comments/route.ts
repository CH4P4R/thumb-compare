import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

const createCommentSchema = z.object({
  targetType: z.enum(["thumbnail", "competitor", "trending"]),
  targetRef: z.string(),
  text: z.string().min(1).max(1000),
});

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const user = await requireAuth();
    const projectId = params.id;
    const body = await request.json();
    const { targetType, targetRef, text } = createCommentSchema.parse(body);

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

    const comment = await prisma.comment.create({
      data: {
        projectId,
        targetType,
        targetRef,
        authorId: user.id,
        text,
      },
      include: {
        author: true,
      },
    });

    return NextResponse.json(comment, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    console.error("Error creating comment:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const user = await requireAuth();
    const projectId = params.id;
    const { searchParams } = new URL(request.url);
    const targetType = searchParams.get("targetType");
    const targetRef = searchParams.get("targetRef");

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

    const where: any = { projectId };
    if (targetType) where.targetType = targetType;
    if (targetRef) where.targetRef = targetRef;

    const comments = await prisma.comment.findMany({
      where,
      include: {
        author: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(comments);
  } catch (error) {
    console.error("Error fetching comments:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

