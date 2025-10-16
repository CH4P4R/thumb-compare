import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { fetchChannelVideos } from "@/lib/youtube";

export async function GET(request: Request) {
  try {
    // Verify job secret
    const authHeader = request.headers.get("authorization");
    const expectedAuth = `Bearer ${process.env.JOB_SECRET}`;

    if (authHeader !== expectedAuth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get all competitor channels
    const competitors = await prisma.competitorChannel.findMany();

    const results = [];

    for (const competitor of competitors) {
      try {
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
              competitorId: competitor.id,
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

        results.push({
          competitorId: competitor.id,
          channelTitle: competitor.channelTitle,
          videosCount: videos.length,
          status: "ok",
        });

        // Log success
        await prisma.jobLog.create({
          data: {
            type: "competitor_refresh",
            status: "ok",
            detail: {
              competitorId: competitor.id,
              channelTitle: competitor.channelTitle,
              videosCount: videos.length,
            },
          },
        });
      } catch (error) {
        console.error(
          `Error refreshing competitor ${competitor.channelTitle}:`,
          error
        );
        results.push({
          competitorId: competitor.id,
          channelTitle: competitor.channelTitle,
          status: "error",
          error: error instanceof Error ? error.message : "Unknown error",
        });

        // Log error
        await prisma.jobLog.create({
          data: {
            type: "competitor_refresh",
            status: "error",
            detail: {
              competitorId: competitor.id,
              error: error instanceof Error ? error.message : "Unknown error",
            },
          },
        });
      }

      // Add delay to avoid rate limiting
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      competitorsProcessed: competitors.length,
      results,
    });
  } catch (error) {
    console.error("Error in competitors job:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

