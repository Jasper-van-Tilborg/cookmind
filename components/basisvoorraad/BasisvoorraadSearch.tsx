'use client';

interface BasisvoorraadSearchProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onFiltersClick?: () => void;
}

export default function BasisvoorraadSearch({
  searchQuery,
  onSearchChange,
  onFiltersClick,
}: BasisvoorraadSearchProps) {
  return (
    <div className="mb-4 flex gap-3 px-6">
      {/* Search bar */}
      <div className="flex flex-1 items-center rounded-xl bg-[#9FC5B5] px-4 py-3">
        <svg
          className="mr-3 h-5 w-5 flex-shrink-0 text-[#1F6F54]"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        <input
          type="text"
          placeholder="Zoeken..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full bg-transparent text-base text-[#2B2B2B] placeholder:text-[#2B2B2B]/60 focus:outline-none"
        />
      </div>

      {/* Filters button */}
      <button
        onClick={onFiltersClick}
        className="rounded-xl bg-[#1F6F54] px-6 py-3 text-sm font-semibold text-[#FAFAF7] transition-colors hover:bg-[#1a5d47]"
      >
        Filters
      </button>
    </div>
  );
}
