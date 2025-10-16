import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { analyzeThumbnail } from "@/lib/score";
import { writeFile, unlink } from "fs/promises";
import { join } from "path";
import { tmpdir } from "os";

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const user = await requireAuth();
    const thumbnailId = params.id;

    // Get thumbnail
    const thumbnail = await prisma.thumbnail.findUnique({
      where: { id: thumbnailId },
      include: {
        project: {
          include: {
            members: true,
          },
        },
      },
    });

    if (!thumbnail) {
      return NextResponse.json({ error: "Thumbnail not found" }, { status: 404 });
    }

    // Check membership
    const isMember = thumbnail.project.members.some((m) => m.userId === user.id);
    if (!isMember) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Download image from Supabase
    const supabase = await createClient();
    const { data, error } = await supabase.storage
      .from("thumbnails")
      .download(thumbnail.storagePath);

    if (error || !data) {
      return NextResponse.json({ error: "Failed to download image" }, { status: 500 });
    }

    // Save to temp file
    const buffer = Buffer.from(await data.arrayBuffer());
    const tempPath = join(tmpdir(), `thumbnail-${thumbnailId}.jpg`);
    await writeFile(tempPath, buffer);

    try {
      // Analyze thumbnail
      const scores = await analyzeThumbnail(tempPath);

      // Update database
      const updated = await prisma.thumbnail.update({
        where: { id: thumbnailId },
        data: {
          avgBrightness: scores.avgBrightness,
          contrast: scores.contrast,
          textRatio: scores.textRatio,
          faceDetected: scores.faceDetected,
          score: scores.score,
        },
      });

      // Clean up temp file
      await unlink(tempPath);

      return NextResponse.json(updated);
    } catch (analysisError) {
      // Clean up temp file on error
      await unlink(tempPath).catch(() => {});
      throw analysisError;
    }
  } catch (error) {
    console.error("Error scoring thumbnail:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

