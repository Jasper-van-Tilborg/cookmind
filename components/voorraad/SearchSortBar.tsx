'use client';

import { useState } from 'react';

interface SearchSortBarProps {
  onSearch: (query: string) => void;
  onSort: (sortBy: 'name' | 'date' | 'quantity') => void;
}

export default function SearchSortBar({ onSearch, onSort }: SearchSortBarProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showSortMenu, setShowSortMenu] = useState(false);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    onSearch(value);
  };

  return (
    <div className="mx-6 mb-4 flex gap-3">
      {/* Search Bar */}
      <div className="relative flex-1">
        <input
          type="text"
          placeholder="Zoeken..."
          value={searchQuery}
          onChange={handleSearchChange}
          className="w-full rounded-xl bg-[#9FC5B5] px-4 py-3 pl-10 text-[#2B2B2B] placeholder:text-[#2B2B2B]/60 focus:outline-none focus:ring-2 focus:ring-[#1F6F54]"
        />
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="absolute left-3 top-1/2 -translate-y-1/2 text-[#2B2B2B]"
        >
          <path
            d="M21 21L15 15M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      {/* Sort Button */}
      <div className="relative">
        <button
          onClick={() => setShowSortMenu(!showSortMenu)}
          className="flex items-center gap-2 rounded-xl bg-[#1F6F54] px-4 py-3 text-base font-semibold text-white transition-colors hover:bg-[#1a5d47]"
        >
          <span>Sorteer</span>
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="text-white"
          >
            <path
              d="M3 6H21M7 12H17M10 18H14"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M19 9L21 7L19 5"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        {showSortMenu && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setShowSortMenu(false)}
            />
            <div className="absolute right-0 top-full z-20 mt-2 w-48 rounded-xl bg-white shadow-lg">
              <button
                onClick={() => {
                  onSort('name');
                  setShowSortMenu(false);
                }}
                className="w-full px-4 py-3 text-left text-sm text-[#2B2B2B] hover:bg-[#E5E5E0] first:rounded-t-xl"
              >
                Sorteer op naam
              </button>
              <button
                onClick={() => {
                  onSort('date');
                  setShowSortMenu(false);
                }}
                className="w-full px-4 py-3 text-left text-sm text-[#2B2B2B] hover:bg-[#E5E5E0]"
              >
                Sorteer op datum
              </button>
              <button
                onClick={() => {
                  onSort('quantity');
                  setShowSortMenu(false);
                }}
                className="w-full px-4 py-3 text-left text-sm text-[#2B2B2B] hover:bg-[#E5E5E0] last:rounded-b-xl"
              >
                Sorteer op hoeveelheid
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
