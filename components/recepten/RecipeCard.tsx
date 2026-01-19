'use client';

import Image from 'next/image';
import Link from 'next/link';
import { RecipeWithMatch } from '@/app/recepten/page';

interface RecipeCardProps {
  recipe: RecipeWithMatch;
  isAdapted?: boolean;
  onAIClick: () => void;
}

export default function RecipeCard({ recipe, isAdapted = false, onAIClick }: RecipeCardProps) {
  const getMatchColor = (percentage: number) => {
    if (percentage >= 100) return 'bg-[#1F6F54]';
    if (percentage >= 75) return 'bg-orange-500';
    if (percentage >= 50) return 'bg-yellow-500';
    return 'bg-gray-400';
  };

  return (
    <Link href={`/recepten/${recipe.id}`} className="block mb-4 rounded-2xl bg-white shadow-sm overflow-hidden">
      {/* Image */}
      <div className="relative h-48 w-full">
        {recipe.image_url ? (
          <Image
            src={recipe.image_url}
            alt={recipe.title}
            fill
            className="object-cover"
          />
        ) : (
          <div className="h-full w-full bg-[#E5E5E0] flex items-center justify-center">
            <svg
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="text-[#2B2B2B]/40"
            >
              <path
                d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15M21 15L12 6L3 15M21 15H3"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        )}

        {/* Match Badge */}
        <div className="absolute top-3 right-3">
          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold text-white ${getMatchColor(
              recipe.matchPercentage
            )}`}
          >
            {recipe.matchPercentage}% Match
          </span>
        </div>

        {/* AI Adapted Star */}
        {isAdapted && (
          <div className="absolute top-3 left-3">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="text-yellow-400 drop-shadow-lg"
              aria-label="AI-aangepast recept"
            >
              <path
                d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
                fill="currentColor"
              />
            </svg>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Title */}
        <div className="flex items-center gap-2 mb-2">
          <h3 className="text-lg font-semibold text-[#2B2B2B]">
            {recipe.title}
          </h3>
          {isAdapted && (
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="text-yellow-400 shrink-0"
              aria-label="AI-aangepast recept"
            >
              <path
                d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
                fill="currentColor"
              />
            </svg>
          )}
        </div>

        {/* Prep Time */}
        <div className="flex items-center gap-1 mb-3 text-sm text-[#2B2B2B]/60">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="text-[#2B2B2B]/60"
          >
            <path
              d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M12 6V12L16 14"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span>{recipe.prep_time} min</span>
        </div>

        {/* Missing Ingredients */}
        {recipe.missingIngredients.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-2">
            {recipe.missingIngredients.slice(0, 3).map((ingredient, index) => (
              <span
                key={index}
                className="text-xs text-[#2B2B2B]/60"
              >
                {ingredient} x
              </span>
            ))}
            {recipe.missingIngredients.length > 3 && (
              <span className="text-xs text-[#2B2B2B]/60">
                +{recipe.missingIngredients.length - 3} meer
              </span>
            )}
          </div>
        )}

        {/* AI Button */}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onAIClick();
          }}
          className="w-full rounded-xl bg-[#1F6F54] px-4 py-3 flex items-center justify-center gap-2 text-white font-semibold transition-colors hover:bg-[#1a5d47]"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="text-white"
          >
            <path
              d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
              fill="currentColor"
            />
          </svg>
          <span>Kijk wat AI kan doen</span>
        </button>
      </div>
    </Link>
  );
}
