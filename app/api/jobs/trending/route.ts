import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { fetchTrendingVideos } from "@/lib/youtube";

export async function GET(request: Request) {
  try {
    // Verify job secret
    const authHeader = request.headers.get("authorization");
    const expectedAuth = `Bearer ${process.env.JOB_SECRET}`;

    if (authHeader !== expectedAuth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get unique region codes from all projects
    const projects = await prisma.project.findMany({
      select: {
        id: true,
        regionCode: true,
      },
    });

    const regionMap = new Map<string, string[]>();
    projects.forEach((project) => {
      if (!regionMap.has(project.regionCode)) {
        regionMap.set(project.regionCode, []);
      }
      regionMap.get(project.regionCode)!.push(project.id);
    });

    const results = [];

    // Fetch trending for each region
    for (const [regionCode, projectIds] of regionMap.entries()) {
      try {
        const videos = await fetchTrendingVideos(regionCode, 50);

        // Update trending videos for each project in this region
        for (const projectId of projectIds) {
          // Delete old trending videos
          await prisma.trendingVideo.deleteMany({
            where: {
              projectId,
              regionCode,
            },
          });

          // Insert new trending videos
          for (const video of videos) {
            await prisma.trendingVideo.create({
              data: {
                projectId,
                regionCode,
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
        }

        results.push({
          regionCode,
          projectCount: projectIds.length,
          videosCount: videos.length,
          status: "ok",
        });

        // Log success
        await prisma.jobLog.create({
          data: {
            type: "trending_fetch",
            status: "ok",
            detail: {
              regionCode,
              projectCount: projectIds.length,
              videosCount: videos.length,
            },
          },
        });
      } catch (error) {
        console.error(`Error fetching trending for ${regionCode}:`, error);
        results.push({
          regionCode,
          projectCount: projectIds.length,
          status: "error",
          error: error instanceof Error ? error.message : "Unknown error",
        });

        // Log error
        await prisma.jobLog.create({
          data: {
            type: "trending_fetch",
            status: "error",
            detail: {
              regionCode,
              error: error instanceof Error ? error.message : "Unknown error",
            },
          },
        });
      }
    }

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      results,
    });
  } catch (error) {
    console.error("Error in trending job:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

