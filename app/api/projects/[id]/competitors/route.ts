import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { fetchChannelInfo } from "@/lib/youtube";

const addCompetitorSchema = z.object({
  ytChannelId: z.string().min(1),
});

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const user = await requireAuth();
    const projectId = params.id;
    const body = await request.json();
    const { ytChannelId } = addCompetitorSchema.parse(body);

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

    // Check if competitor already exists
    const existing = await prisma.competitorChannel.findFirst({
      where: {
        projectId,
        ytChannelId,
      },
    });

    if (existing) {
      return NextResponse.json({ error: "Competitor already added" }, { status: 400 });
    }

    // Fetch channel info from YouTube
    const channelInfo = await fetchChannelInfo(ytChannelId);
    if (!channelInfo) {
      return NextResponse.json({ error: "Channel not found" }, { status: 404 });
    }

    // Create competitor
    const competitor = await prisma.competitorChannel.create({
      data: {
        projectId,
        ytChannelId,
        channelTitle: channelInfo.title,
        addedBy: user.id,
      },
    });

    return NextResponse.json(competitor, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    console.error("Error adding competitor:", error);
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

    const competitors = await prisma.competitorChannel.findMany({
      where: {
        projectId,
      },
      include: {
        videos: {
          orderBy: {
            publishedAt: "desc",
          },
          take: 10,
        },
        _count: {
          select: {
            videos: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(competitors);
  } catch (error) {
    console.error("Error fetching competitors:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

