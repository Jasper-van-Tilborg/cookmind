'use client';

import { useState, useRef, useEffect } from 'react';
import { ALL_INGREDIENTS } from '@/lib/constants/ingredients';

interface IngredientTagSelectorProps {
  suggestedTag: string | null;
  value: string | null;
  onChange: (tag: string | null) => void;
  onClose?: () => void;
}

export default function IngredientTagSelector({
  suggestedTag,
  value,
  onChange,
  onClose,
}: IngredientTagSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customTag, setCustomTag] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Filter ingredients based on search query
  const filteredIngredients = ALL_INGREDIENTS.filter((ingredient) =>
    ingredient.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelect = (tag: string) => {
    onChange(tag);
    if (onClose) {
      onClose();
    }
  };

  const handleCustomTag = () => {
    if (customTag.trim()) {
      onChange(customTag.trim());
      if (onClose) {
        onClose();
      }
    }
  };

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        if (onClose) {
          onClose();
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div
        ref={dropdownRef}
        className="w-full max-w-md rounded-xl bg-[#FAFAF7] p-6 shadow-lg"
      >
        <h3 className="mb-4 text-lg font-semibold text-[#2B2B2B]">
          Selecteer ingrediënt
        </h3>

        {suggestedTag && (
          <div className="mb-4">
            <p className="mb-2 text-sm text-[#2B2B2B]/60">Voorgesteld:</p>
            <button
              onClick={() => handleSelect(suggestedTag)}
              className="w-full rounded-lg bg-[#D6EDE2] px-4 py-3 text-left font-medium text-[#1F6F54] transition-colors hover:bg-[#C6DDD2]"
            >
              {suggestedTag}
            </button>
          </div>
        )}

        {!showCustomInput ? (
          <>
            <div className="mb-4">
              <input
                type="text"
                placeholder="Zoek ingrediënt..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-lg border border-[#E5E5E0] bg-white px-4 py-2 text-sm text-[#2B2B2B] focus:border-[#1F6F54] focus:outline-none"
                autoFocus
              />
            </div>

            <div className="max-h-64 overflow-y-auto">
              {filteredIngredients.length > 0 ? (
                <div className="space-y-1">
                  {filteredIngredients.map((ingredient) => (
                    <button
                      key={ingredient}
                      onClick={() => handleSelect(ingredient)}
                      className={`w-full rounded-lg px-4 py-2 text-left text-sm transition-colors ${
                        ingredient === suggestedTag
                          ? 'bg-[#D6EDE2] text-[#1F6F54]'
                          : 'bg-white text-[#2B2B2B] hover:bg-[#E5E5E0]'
                      }`}
                    >
                      {ingredient}
                    </button>
                  ))}
                </div>
              ) : (
                <p className="py-4 text-center text-sm text-[#2B2B2B]/60">
                  Geen ingrediënten gevonden
                </p>
              )}
            </div>

            <div className="mt-4 flex gap-2">
              <button
                onClick={() => setShowCustomInput(true)}
                className="flex-1 rounded-lg border border-[#E5E5E0] bg-white px-4 py-2 text-sm font-medium text-[#2B2B2B] transition-colors hover:bg-[#E5E5E0]"
              >
                Anders...
              </button>
              <button
                onClick={() => {
                  onChange(null);
                  if (onClose) {
                    onClose();
                  }
                }}
                className="flex-1 rounded-lg border border-[#E5E5E0] bg-white px-4 py-2 text-sm font-medium text-[#2B2B2B] transition-colors hover:bg-[#E5E5E0]"
              >
                Overslaan
              </button>
            </div>
          </>
        ) : (
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Voer custom ingrediënt in..."
              value={customTag}
              onChange={(e) => setCustomTag(e.target.value)}
              className="w-full rounded-lg border border-[#E5E5E0] bg-white px-4 py-2 text-sm text-[#2B2B2B] focus:border-[#1F6F54] focus:outline-none"
              autoFocus
            />
            <div className="flex gap-2">
              <button
                onClick={handleCustomTag}
                className="flex-1 rounded-lg bg-[#1F6F54] px-4 py-2 text-sm font-medium text-[#FAFAF7] transition-colors hover:bg-[#1a5d47]"
              >
                Toevoegen
              </button>
              <button
                onClick={() => setShowCustomInput(false)}
                className="flex-1 rounded-lg border border-[#E5E5E0] bg-white px-4 py-2 text-sm font-medium text-[#2B2B2B] transition-colors hover:bg-[#E5E5E0]"
              >
                Terug
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
