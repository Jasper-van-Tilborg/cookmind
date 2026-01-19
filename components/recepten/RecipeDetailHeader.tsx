'use client';

interface RecipeDetailHeaderProps {
  onBack: () => void;
  isFavorite: boolean;
  onFavoriteToggle: () => void;
}

export default function RecipeDetailHeader({
  onBack,
  isFavorite,
  onFavoriteToggle,
}: RecipeDetailHeaderProps) {
  return (
    <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between p-4">
      {/* Back Button */}
      <button
        onClick={onBack}
        className="flex h-10 w-10 items-center justify-center rounded-full bg-white/90 backdrop-blur-sm transition-colors hover:bg-white"
        aria-label="Terug"
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="text-[#1F6F54]"
        >
          <path
            d="M19 12H5M5 12L12 19M5 12L12 5"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {/* Favorite Button */}
      <button
        onClick={onFavoriteToggle}
        className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/90 backdrop-blur-sm border border-[#E5E5E0] transition-colors hover:bg-white"
        aria-label={isFavorite ? 'Verwijder uit favorieten' : 'Voeg toe aan favorieten'}
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={isFavorite ? 'text-red-500' : 'text-[#2B2B2B]'}
        >
          <path
            d="M20.84 4.61C20.3292 4.099 19.7228 3.69364 19.0554 3.41708C18.3879 3.14052 17.6725 2.99817 16.95 2.99817C16.2275 2.99817 15.5121 3.14052 14.8446 3.41708C14.1772 3.69364 13.5708 4.099 13.06 4.61L12 5.67L10.94 4.61C9.9083 3.57831 8.50903 2.99871 7.05 2.99871C5.59096 2.99871 4.19169 3.57831 3.16 4.61C2.1283 5.64169 1.54871 7.04097 1.54871 8.5C1.54871 9.95903 2.1283 11.3583 3.16 12.39L4.22 13.45L12 21.23L19.78 13.45L20.84 12.39C21.351 11.8792 21.7564 11.2728 22.0329 10.6054C22.3095 9.93789 22.4518 9.22248 22.4518 8.5C22.4518 7.77752 22.3095 7.0621 22.0329 6.39464C21.7564 5.72718 21.351 5.12075 20.84 4.61Z"
            fill={isFavorite ? 'currentColor' : 'none'}
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
    </div>
  );
}
