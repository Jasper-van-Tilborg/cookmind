'use client';

import { useState } from 'react';

export default function RecipesHeader() {
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [showFilterMenu, setShowFilterMenu] = useState(false);

  return (
    <div className="border-b border-[#E5E5E0] bg-[#FAFAF7] px-6 py-4">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-[#1F6F54]">Recepten</h1>
          <p className="mt-1 text-sm text-[#2B2B2B]/60">
            Recepten op basis van jouw voorraad
          </p>
        </div>

        <div className="ml-4 flex gap-2">
          {/* Sort Button */}
          <div className="relative">
            <button
              onClick={() => {
                setShowSortMenu(!showSortMenu);
                setShowFilterMenu(false);
              }}
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-white border border-[#E5E5E0] transition-colors hover:bg-[#E5E5E0]"
              aria-label="Sorteer"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="text-[#2B2B2B]"
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
                <div className="absolute right-0 top-full z-20 mt-2 w-48 rounded-xl bg-white shadow-lg border border-[#E5E5E0]">
                  <button
                    onClick={() => {
                      // TODO: Implement sort
                      setShowSortMenu(false);
                    }}
                    className="w-full px-4 py-3 text-left text-sm text-[#2B2B2B] hover:bg-[#E5E5E0] first:rounded-t-xl"
                  >
                    Sorteer op match
                  </button>
                  <button
                    onClick={() => {
                      // TODO: Implement sort
                      setShowSortMenu(false);
                    }}
                    className="w-full px-4 py-3 text-left text-sm text-[#2B2B2B] hover:bg-[#E5E5E0]"
                  >
                    Sorteer op bereidingstijd
                  </button>
                  <button
                    onClick={() => {
                      // TODO: Implement sort
                      setShowSortMenu(false);
                    }}
                    className="w-full px-4 py-3 text-left text-sm text-[#2B2B2B] hover:bg-[#E5E5E0] last:rounded-b-xl"
                  >
                    Sorteer op naam
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Filter Button */}
          <div className="relative">
            <button
              onClick={() => {
                setShowFilterMenu(!showFilterMenu);
                setShowSortMenu(false);
              }}
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-white border border-[#E5E5E0] transition-colors hover:bg-[#E5E5E0]"
              aria-label="Filter"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="text-[#2B2B2B]"
              >
                <path
                  d="M3 6H21M6 12H18M9 18H15"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>

            {showFilterMenu && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowFilterMenu(false)}
                />
                <div className="absolute right-0 top-full z-20 mt-2 w-48 rounded-xl bg-white shadow-lg border border-[#E5E5E0]">
                  <button
                    onClick={() => {
                      // TODO: Implement filter
                      setShowFilterMenu(false);
                    }}
                    className="w-full px-4 py-3 text-left text-sm text-[#2B2B2B] hover:bg-[#E5E5E0] first:rounded-t-xl"
                  >
                    Alle recepten
                  </button>
                  <button
                    onClick={() => {
                      // TODO: Implement filter
                      setShowFilterMenu(false);
                    }}
                    className="w-full px-4 py-3 text-left text-sm text-[#2B2B2B] hover:bg-[#E5E5E0]"
                  >
                    100% Match
                  </button>
                  <button
                    onClick={() => {
                      // TODO: Implement filter
                      setShowFilterMenu(false);
                    }}
                    className="w-full px-4 py-3 text-left text-sm text-[#2B2B2B] hover:bg-[#E5E5E0] last:rounded-b-xl"
                  >
                    Makkelijk
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
