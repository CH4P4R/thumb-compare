import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { fetchChannelVideos } from "@/lib/youtube";

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const user = await requireAuth();
    const competitorId = params.id;

    // Get competitor
    const competitor = await prisma.competitorChannel.findUnique({
      where: { id: competitorId },
      include: {
        project: {
          include: {
            members: true,
          },
        },
      },
    });

    if (!competitor) {
      return NextResponse.json({ error: "Competitor not found" }, { status: 404 });
    }

    // Check membership
    const isMember = competitor.project.members.some((m) => m.userId === user.id);
    if (!isMember) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Fetch videos from YouTube
    const videos = await fetchChannelVideos(competitor.ytChannelId, 25);

    // Upsert videos
    for (const video of videos) {
      await prisma.competitorVideo.upsert({
        where: { ytVideoId: video.id },
        update: {
          title: video.title,
          thumbnailUrl: video.thumbnailUrl,
          viewCount: video.viewCount,
          likeCount: video.likeCount,
          commentCount: video.commentCount,
          fetchedAt: new Date(),
        },
        create: {
          competitorId,
          ytVideoId: video.id,
          title: video.title,
          thumbnailUrl: video.thumbnailUrl,
          publishedAt: new Date(video.publishedAt),
          viewCount: video.viewCount,
          likeCount: video.likeCount,
          commentCount: video.commentCount,
        },
      });
    }

    return NextResponse.json({
      success: true,
      videosCount: videos.length,
    });
  } catch (error) {
    console.error("Error refreshing competitor videos:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

