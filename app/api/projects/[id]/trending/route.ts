import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

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

    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // Get trending videos for this project's region
    const trending = await prisma.trendingVideo.findMany({
      where: {
        projectId,
        regionCode: project.regionCode,
      },
      orderBy: {
        fetchedAt: "desc",
      },
      take: 50,
    });

    return NextResponse.json(trending);
  } catch (error) {
    console.error("Error fetching trending:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

