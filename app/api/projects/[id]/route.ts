import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const user = await requireAuth();
    const projectId = params.id;

    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        members: {
          some: {
            userId: user.id,
          },
        },
      },
      include: {
        members: {
          include: {
            user: true,
          },
        },
        thumbnails: {
          orderBy: {
            createdAt: "desc",
          },
        },
        competitors: {
          include: {
            videos: {
              orderBy: {
                publishedAt: "desc",
              },
              take: 10,
            },
          },
        },
        trending: {
          orderBy: {
            fetchedAt: "desc",
          },
          take: 50,
        },
        _count: {
          select: {
            thumbnails: true,
            competitors: true,
            comments: true,
            annotations: true,
          },
        },
      },
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    return NextResponse.json(project);
  } catch (error) {
    console.error("Error fetching project:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const user = await requireAuth();
    const projectId = params.id;
    const body = await request.json();

    // Check if user is owner
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        ownerId: user.id,
      },
    });

    if (!project) {
      return NextResponse.json(
        { error: "Project not found or unauthorized" },
        { status: 404 }
      );
    }

    const updated = await prisma.project.update({
      where: { id: projectId },
      data: {
        name: body.name,
        regionCode: body.regionCode,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating project:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const user = await requireAuth();
    const projectId = params.id;

    // Check if user is owner
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        ownerId: user.id,
      },
    });

    if (!project) {
      return NextResponse.json(
        { error: "Project not found or unauthorized" },
        { status: 404 }
      );
    }

    await prisma.project.delete({
      where: { id: projectId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting project:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

