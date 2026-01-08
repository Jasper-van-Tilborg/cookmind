'use client';

import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Clock, Users } from 'lucide-react';
import MatchBadge from '@/src/components/recipes/MatchBadge';
import VideoThumbnail from './VideoThumbnail';
import { UserRecipe } from '@/src/types';

interface DiscoverRecipeCardProps {
  recipe: UserRecipe;
  match: number;
  onClick?: () => void;
}

export default function DiscoverRecipeCard({
  recipe,
  match,
  onClick,
}: DiscoverRecipeCardProps) {
  const router = useRouter();

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      // Navigate to recipe detail (would need user recipe detail page)
      router.push(`/recipes/${recipe.id}`);
    }
  };

  return (
    <div
      onClick={handleClick}
      className="bg-white rounded-xl shadow-sm overflow-hidden cursor-pointer hover:shadow-md transition-all duration-200 active:scale-[0.98]"
    >
      {/* Image/Video Section */}
      <div className="relative w-full aspect-[4/3] bg-gray-200">
        {recipe.isVideo && recipe.videoUrl ? (
          <VideoThumbnail
            thumbnailUrl={recipe.thumbnailUrl || recipe.imageUrl}
            videoUrl={recipe.videoUrl}
            alt={recipe.title}
            onClick={handleClick}
            className="rounded-none"
          />
        ) : recipe.imageUrl ? (
          <Image
            src={recipe.imageUrl}
            alt={recipe.title}
            fill
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            Geen afbeelding
          </div>
        )}
        
        {/* Match Badge */}
        <div className="absolute top-3 right-3">
          <MatchBadge percentage={match} size="sm" />
        </div>
      </div>

      {/* Content Section */}
      <div className="p-4 space-y-2">
        {/* Title */}
        <h3 className="font-bold text-gray-800 text-lg line-clamp-2 leading-tight">
          {recipe.title}
        </h3>

        {/* Username */}
        <p className="text-sm text-gray-600 font-medium">
          @{recipe.username}
        </p>

        {/* Description/Caption */}
        <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
          {recipe.description}
        </p>

        {/* Meta Info */}
        <div className="flex items-center gap-3 text-xs text-gray-500 pt-1">
          <div className="flex items-center gap-1">
            <Clock size={14} />
            <span>{recipe.prepTime} min</span>
          </div>
          <div className="flex items-center gap-1">
            <Users size={14} />
            <span>{recipe.servings} pers.</span>
          </div>
          {recipe.difficulty && (
            <span className="text-xs font-medium text-purple-600">
              {recipe.difficulty}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}


