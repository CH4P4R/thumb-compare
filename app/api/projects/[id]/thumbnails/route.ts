import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import sharp from "sharp";
import { nanoid } from "nanoid";

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

    const formData = await request.formData();
    const file = formData.get("file") as File;
    const title = formData.get("title") as string;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "Invalid file type" }, { status: 400 });
    }

    // Read file buffer
    const buffer = Buffer.from(await file.arrayBuffer());

    // Get image metadata
    const metadata = await sharp(buffer).metadata();

    // Upload to Supabase Storage
    const supabase = await createClient();
    const fileName = `${projectId}/${nanoid()}-${file.name}`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("thumbnails")
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      console.error("Upload error:", uploadError);
      return NextResponse.json({ error: "Failed to upload file" }, { status: 500 });
    }

    // Create thumbnail record
    const thumbnail = await prisma.thumbnail.create({
      data: {
        projectId,
        title: title || file.name,
        storagePath: uploadData.path,
        width: metadata.width || 0,
        height: metadata.height || 0,
      },
    });

    return NextResponse.json(thumbnail, { status: 201 });
  } catch (error) {
    console.error("Error uploading thumbnail:", error);
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

    const thumbnails = await prisma.thumbnail.findMany({
      where: {
        projectId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Get signed URLs from Supabase
    const supabase = await createClient();
    const thumbnailsWithUrls = await Promise.all(
      thumbnails.map(async (thumbnail) => {
        const { data } = supabase.storage.from("thumbnails").getPublicUrl(thumbnail.storagePath);
        return {
          ...thumbnail,
          url: data.publicUrl,
        };
      })
    );

    return NextResponse.json(thumbnailsWithUrls);
  } catch (error) {
    console.error("Error fetching thumbnails:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

