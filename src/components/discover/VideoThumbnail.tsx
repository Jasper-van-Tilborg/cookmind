'use client';

import { Play } from 'lucide-react';
import Image from 'next/image';

interface VideoThumbnailProps {
  thumbnailUrl?: string;
  videoUrl?: string;
  alt: string;
  onClick?: () => void;
  className?: string;
}

export default function VideoThumbnail({
  thumbnailUrl,
  videoUrl,
  alt,
  onClick,
  className = '',
}: VideoThumbnailProps) {
  return (
    <div
      className={`relative w-full aspect-video bg-gray-200 rounded-lg overflow-hidden cursor-pointer group ${className}`}
      onClick={onClick}
    >
      {thumbnailUrl ? (
        <Image
          src={thumbnailUrl}
          alt={alt}
          fill
          className="object-cover"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-gray-300">
          <span className="text-gray-500 text-sm">Geen thumbnail</span>
        </div>
      )}
      
      {/* Play icon overlay */}
      <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/30 transition-colors">
        <div className="bg-white/90 rounded-full p-4 group-hover:bg-white transition-colors">
          <Play size={32} className="text-purple-600 ml-1" fill="currentColor" />
        </div>
      </div>
    </div>
  );
}

