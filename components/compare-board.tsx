"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Shuffle, Grid3x3, Filter } from "lucide-react";

interface ThumbnailItem {
  id: string;
  title: string;
  url: string;
  type: "own" | "competitor" | "trending";
  score?: number;
  viewCount?: number;
  channelTitle?: string;
}

interface CompareBoardProps {
  items: ThumbnailItem[];
  onItemClick?: (item: ThumbnailItem) => void;
}

export function CompareBoard({ items, onItemClick }: CompareBoardProps) {
  const [shuffled, setShuffled] = useState(false);
  const [filter, setFilter] = useState<"all" | "own" | "competitor" | "trending">("all");

  const displayItems = useMemo(() => {
    let filtered = items;

    // Apply filter
    if (filter !== "all") {
      filtered = items.filter((item) => item.type === filter);
    }

    // Apply shuffle
    if (shuffled) {
      return [...filtered].sort(() => Math.random() - 0.5);
    }

    return filtered;
  }, [items, filter, shuffled]);

  const handleShuffle = () => {
    setShuffled(!shuffled);
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "own":
        return "bg-blue-500";
      case "competitor":
        return "bg-orange-500";
      case "trending":
        return "bg-green-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <Button
            variant={shuffled ? "default" : "outline"}
            size="sm"
            onClick={handleShuffle}
          >
            <Shuffle className="w-4 h-4 mr-2" />
            Shuffle
          </Button>
          <Button
            variant={filter === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("all")}
          >
            <Grid3x3 className="w-4 h-4 mr-2" />
            Show All
          </Button>
        </div>

        <div className="flex gap-2">
          <Button
            variant={filter === "own" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter(filter === "own" ? "all" : "own")}
          >
            Mine
          </Button>
          <Button
            variant={filter === "competitor" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter(filter === "competitor" ? "all" : "competitor")}
          >
            Competitors
          </Button>
          <Button
            variant={filter === "trending" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter(filter === "trending" ? "all" : "trending")}
          >
            Trending
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="flex gap-4 text-sm text-gray-600">
        <span>Total: {displayItems.length}</span>
        <span>Own: {items.filter((i) => i.type === "own").length}</span>
        <span>Competitors: {items.filter((i) => i.type === "competitor").length}</span>
        <span>Trending: {items.filter((i) => i.type === "trending").length}</span>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {displayItems.map((item) => (
          <div
            key={item.id}
            className="relative group cursor-pointer rounded-lg overflow-hidden border-2 border-gray-200 hover:border-gray-300 transition-all"
            onClick={() => onItemClick?.(item)}
          >
            <div className="aspect-video relative bg-gray-100">
              <Image
                src={item.url}
                alt={item.title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 20vw"
              />
              {/* Type Badge */}
              <div
                className={`absolute top-2 left-2 ${getTypeColor(
                  item.type
                )} text-white text-xs px-2 py-1 rounded`}
              >
                {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
              </div>
            </div>
            <div className="p-3 bg-white">
              <h3 className="font-medium text-sm truncate">{item.title}</h3>
              <div className="flex justify-between items-center mt-2 text-xs text-gray-500">
                {item.channelTitle && (
                  <span className="truncate">{item.channelTitle}</span>
                )}
                {item.score !== undefined && (
                  <span className="font-semibold text-blue-600">
                    {item.score.toFixed(1)}
                  </span>
                )}
                {item.viewCount !== undefined && (
                  <span>{(item.viewCount / 1000).toFixed(1)}K views</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {displayItems.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          No thumbnails to display. Try adjusting your filters or adding content.
        </div>
      )}
    </div>
  );
}

