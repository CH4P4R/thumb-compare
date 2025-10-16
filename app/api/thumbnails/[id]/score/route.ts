import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { analyzeThumbnail } from "@/lib/score";
import { analyzeWithAI } from "@/lib/ai/vision-analyzer";
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
      // Analyze thumbnail with traditional methods
      const scores = await analyzeThumbnail(tempPath);

      // Get public URL for AI analysis
      const { data: publicUrlData } = supabase.storage
        .from("thumbnails")
        .getPublicUrl(thumbnail.storagePath);

      // AI Analysis (optional - requires OpenAI API key)
      let aiAnalysis = null;
      if (process.env.OPENAI_API_KEY) {
        try {
          aiAnalysis = await analyzeWithAI(publicUrlData.publicUrl);
        } catch (aiError) {
          console.warn("AI analysis failed:", aiError);
          // Continue without AI analysis
        }
      }

      // Combine scores
      const finalScore = aiAnalysis?.clickworthiness 
        ? (scores.score * 0.6 + aiAnalysis.clickworthiness * 0.4) 
        : scores.score;

      // Update database
      const updated = await prisma.thumbnail.update({
        where: { id: thumbnailId },
        data: {
          avgBrightness: scores.avgBrightness,
          contrast: scores.contrast,
          textRatio: scores.textRatio,
          faceDetected: aiAnalysis?.faceDetected ?? scores.faceDetected,
          score: finalScore,
        },
      });

      // Clean up temp file
      await unlink(tempPath);

      return NextResponse.json({
        ...updated,
        aiAnalysis, // Include AI insights
      });
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

