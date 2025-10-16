"use client";

import { useState } from "react";
import Image from "next/image";

interface Thumbnail {
  id: string;
  title: string;
  url: string;
  score?: number;
  width: number;
  height: number;
}

interface ThumbnailGridProps {
  thumbnails: Thumbnail[];
  onSelect?: (thumbnail: Thumbnail) => void;
}

export function ThumbnailGrid({ thumbnails, onSelect }: ThumbnailGridProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const handleClick = (thumbnail: Thumbnail) => {
    setSelectedId(thumbnail.id);
    onSelect?.(thumbnail);
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {thumbnails.map((thumbnail) => (
        <div
          key={thumbnail.id}
          className={`relative group cursor-pointer rounded-lg overflow-hidden border-2 transition-all ${
            selectedId === thumbnail.id
              ? "border-blue-500 shadow-lg"
              : "border-gray-200 hover:border-gray-300"
          }`}
          onClick={() => handleClick(thumbnail)}
        >
          <div className="aspect-video relative bg-gray-100">
            <Image
              src={thumbnail.url}
              alt={thumbnail.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
            />
          </div>
          <div className="p-3 bg-white">
            <h3 className="font-medium text-sm truncate">{thumbnail.title}</h3>
            <div className="flex justify-between items-center mt-2 text-xs text-gray-500">
              <span>
                {thumbnail.width}x{thumbnail.height}
              </span>
              {thumbnail.score !== undefined && (
                <span className="font-semibold text-blue-600">
                  Score: {thumbnail.score.toFixed(1)}
                </span>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

