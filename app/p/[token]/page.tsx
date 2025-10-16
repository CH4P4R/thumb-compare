import { prisma } from "@/lib/prisma";
import { CompareBoard } from "@/components/compare-board";
import { notFound } from "next/navigation";

interface ThumbnailItem {
  id: string;
  title: string;
  url: string;
  type: "own" | "competitor" | "trending";
  score?: number;
  viewCount?: number;
  channelTitle?: string;
}

export default async function PublicSharePage({
  params,
}: {
  params: { token: string };
}) {
  // Get share link
  const shareLink = await prisma.shareLink.findUnique({
    where: { token: params.token },
    include: {
      project: {
        include: {
          thumbnails: true,
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
        },
      },
    },
  });

  if (!shareLink) {
    notFound();
  }

  // Check if expired
  if (shareLink.expiresAt && shareLink.expiresAt < new Date()) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Link Expired</h1>
          <p className="text-gray-600">This share link has expired.</p>
        </div>
      </div>
    );
  }

  const project = shareLink.project;

  // Combine all items
  const items: ThumbnailItem[] = [];

  // Add own thumbnails
  project.thumbnails.forEach((thumb) => {
    items.push({
      id: thumb.id,
      title: thumb.title,
      url: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/thumbnails/${thumb.storagePath}`,
      type: "own",
      score: thumb.score || undefined,
    });
  });

  // Add competitor videos
  project.competitors.forEach((comp) => {
    comp.videos.forEach((video) => {
      items.push({
        id: video.id,
        title: video.title,
        url: video.thumbnailUrl,
        type: "competitor",
        viewCount: video.viewCount || undefined,
        channelTitle: comp.channelTitle || undefined,
      });
    });
  });

  // Add trending videos
  project.trending.forEach((video) => {
    items.push({
      id: video.id,
      title: video.title,
      url: video.thumbnailUrl,
      type: "trending",
      viewCount: video.viewCount || undefined,
      channelTitle: video.channelTitle,
    });
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">{project.name}</h1>
              <p className="text-gray-600 text-sm mt-1">
                Read-only view • Region: {project.regionCode}
              </p>
            </div>
            <div className="text-sm text-gray-500">
              Powered by <span className="font-semibold text-blue-600">ThumbCompare</span>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <CompareBoard items={items} />
        </div>
      </main>
    </div>
  );
}

