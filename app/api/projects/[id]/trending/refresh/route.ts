import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { fetchTrendingVideos } from "@/lib/youtube";

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const user = await requireAuth();
    const projectId = params.id;

    // Check membership
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

    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // Fetch trending videos
    const videos = await fetchTrendingVideos(project.regionCode, 50);

    // Delete old trending videos for this project/region
    await prisma.trendingVideo.deleteMany({
      where: {
        projectId,
        regionCode: project.regionCode,
      },
    });

    // Insert new trending videos
    for (const video of videos) {
      await prisma.trendingVideo.create({
        data: {
          projectId,
          regionCode: project.regionCode,
          ytVideoId: video.id,
          title: video.title,
          thumbnailUrl: video.thumbnailUrl,
          channelTitle: video.channelTitle,
          publishedAt: new Date(video.publishedAt),
          viewCount: video.viewCount,
          likeCount: video.likeCount,
        },
      });
    }

    return NextResponse.json({
      success: true,
      videosCount: videos.length,
      regionCode: project.regionCode,
    });
  } catch (error) {
    console.error("Error refreshing trending:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

