"use client";

import { use, useEffect, useState } from "react";
import { CompareBoard } from "@/components/compare-board";
import { CollabSidebar } from "@/components/collab-sidebar";
import { Button } from "@/components/ui/button";
import { 
  Upload, 
  Plus, 
  RefreshCw, 
  Share2, 
  Settings, 
  TrendingUp 
} from "lucide-react";

interface ThumbnailItem {
  id: string;
  title: string;
  url: string;
  type: "own" | "competitor" | "trending";
  score?: number;
  viewCount?: number;
  channelTitle?: string;
}

export default function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const projectId = resolvedParams.id;
  
  const [project, setProject] = useState<any>(null);
  const [items, setItems] = useState<ThumbnailItem[]>([]);
  const [comments, setComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUpload, setShowUpload] = useState(false);
  const [showAddCompetitor, setShowAddCompetitor] = useState(false);

  useEffect(() => {
    loadProject();
    loadComments();
  }, [projectId]);

  const loadProject = async () => {
    try {
      const response = await fetch(`/api/projects/${projectId}`);
      if (!response.ok) throw new Error("Failed to load project");
      
      const data = await response.json();
      setProject(data);

      // Combine all items
      const allItems: ThumbnailItem[] = [];

      // Add own thumbnails
      if (data.thumbnails) {
        data.thumbnails.forEach((thumb: any) => {
          allItems.push({
            id: thumb.id,
            title: thumb.title,
            url: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/thumbnails/${thumb.storagePath}`,
            type: "own",
            score: thumb.score,
          });
        });
      }

      // Add competitor videos
      if (data.competitors) {
        data.competitors.forEach((comp: any) => {
          comp.videos?.forEach((video: any) => {
            allItems.push({
              id: video.id,
              title: video.title,
              url: video.thumbnailUrl,
              type: "competitor",
              viewCount: video.viewCount,
              channelTitle: comp.channelTitle,
            });
          });
        });
      }

      // Add trending videos
      if (data.trending) {
        data.trending.forEach((video: any) => {
          allItems.push({
            id: video.id,
            title: video.title,
            url: video.thumbnailUrl,
            type: "trending",
            viewCount: video.viewCount,
            channelTitle: video.channelTitle,
          });
        });
      }

      setItems(allItems);
      setLoading(false);
    } catch (error) {
      console.error("Error loading project:", error);
      setLoading(false);
    }
  };

  const loadComments = async () => {
    try {
      const response = await fetch(`/api/projects/${projectId}/comments`);
      if (response.ok) {
        const data = await response.json();
        setComments(data);
      }
    } catch (error) {
      console.error("Error loading comments:", error);
    }
  };

  const handleAddComment = async (text: string) => {
    try {
      const response = await fetch(`/api/projects/${projectId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetType: "thumbnail",
          targetRef: "general",
          text,
        }),
      });

      if (response.ok) {
        await loadComments();
      }
    } catch (error) {
      console.error("Error adding comment:", error);
    }
  };

  const handleRefreshTrending = async () => {
    try {
      const response = await fetch(
        `/api/projects/${projectId}/trending/refresh`,
        { method: "POST" }
      );
      if (response.ok) {
        await loadProject();
      }
    } catch (error) {
      console.error("Error refreshing trending:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading project...</p>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Project not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{project.name}</h1>
          <p className="text-gray-600 mt-1">
            Region: {project.regionCode} • {project._count.thumbnails} thumbnails •{" "}
            {project._count.competitors} competitors
          </p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline">
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </Button>
          <Button size="sm" variant="outline">
            <Share2 className="w-4 h-4 mr-2" />
            Share
          </Button>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <Button size="sm" onClick={() => setShowUpload(true)}>
          <Upload className="w-4 h-4 mr-2" />
          Upload Thumbnail
        </Button>
        <Button size="sm" variant="outline" onClick={() => setShowAddCompetitor(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Competitor
        </Button>
        <Button size="sm" variant="outline" onClick={handleRefreshTrending}>
          <TrendingUp className="w-4 h-4 mr-2" />
          Refresh Trending
        </Button>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Compare Board */}
        <div className="lg:col-span-3">
          <div className="bg-white p-6 rounded-lg border shadow-sm">
            <CompareBoard items={items} />
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg border shadow-sm h-[600px]">
            <CollabSidebar comments={comments} onAddComment={handleAddComment} />
          </div>
        </div>
      </div>
    </div>
  );
}

