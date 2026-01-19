'use client';

import { useState, useRef, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
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
  const supabase = createClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customTag, setCustomTag] = useState('');
  const [customTags, setCustomTags] = useState<string[]>([]);
  const [isLoadingCustomTags, setIsLoadingCustomTags] = useState(true);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Load user's custom tags
  useEffect(() => {
    const loadCustomTags = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setIsLoadingCustomTags(false);
          return;
        }

        const { data, error } = await supabase
          .from('user_custom_tags')
          .select('tag_name')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) {
          // Table might not exist yet, ignore error
          console.error('Error loading custom tags:', error);
          setCustomTags([]);
        } else {
          setCustomTags((data || []).map((item) => item.tag_name));
        }
      } catch (error) {
        console.error('Error loading custom tags:', error);
        setCustomTags([]);
      } finally {
        setIsLoadingCustomTags(false);
      }
    };

    loadCustomTags();
  }, [supabase]);

  // Filter ingredients and custom tags based on search query
  const searchLower = searchQuery.toLowerCase();
  const filteredCustomTags = customTags.filter((tag) =>
    tag.toLowerCase().includes(searchLower)
  );
  const filteredIngredients = ALL_INGREDIENTS.filter((ingredient) =>
    ingredient.toLowerCase().includes(searchLower)
  );

  const handleSelect = (tag: string) => {
    onChange(tag);
    if (onClose) {
      onClose();
    }
  };

  const handleCustomTag = async () => {
    if (!customTag.trim()) return;

    const tagName = customTag.trim();
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        // Still allow tag selection even if not logged in (shouldn't happen)
        onChange(tagName);
        if (onClose) {
          onClose();
        }
        return;
      }

      // Save custom tag to database
      const { error } = await supabase
        .from('user_custom_tags')
        .insert({
          user_id: user.id,
          tag_name: tagName,
        })
        .select();

      if (error) {
        // Check if it's a duplicate error (unique constraint)
        const isDuplicate = error.code === '23505' || error.message.includes('duplicate');
        if (!isDuplicate) {
          console.error('Error saving custom tag:', error);
        }
        // Continue anyway - tag might already exist
      } else {
        // Add to local state
        setCustomTags((prev) => [tagName, ...prev]);
      }

      // Use the tag
      onChange(tagName);
      if (onClose) {
        onClose();
      }
    } catch (error) {
      console.error('Error saving custom tag:', error);
      // Still allow tag selection even if save fails
      onChange(tagName);
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
              {filteredCustomTags.length > 0 || filteredIngredients.length > 0 ? (
                <div className="space-y-1">
                  {/* Custom Tags Section */}
                  {filteredCustomTags.length > 0 && (
                    <>
                      <div className="mb-2 px-2 text-xs font-semibold text-[#2B2B2B]/60 uppercase tracking-wide">
                        Mijn tags
                      </div>
                      {filteredCustomTags.map((tag) => (
                        <button
                          key={`custom-${tag}`}
                          onClick={() => handleSelect(tag)}
                          className={`w-full rounded-lg px-4 py-2 text-left text-sm transition-colors ${
                            tag === suggestedTag
                              ? 'bg-[#D6EDE2] text-[#1F6F54]'
                              : 'bg-[#F0F8F5] text-[#1F6F54] hover:bg-[#E0F0EA]'
                          }`}
                        >
                          {tag}
                        </button>
                      ))}
                      {filteredIngredients.length > 0 && (
                        <div className="my-2 border-t border-[#E5E5E0]"></div>
                      )}
                    </>
                  )}
                  {/* Standard Ingredients Section */}
                  {filteredIngredients.length > 0 && (
                    <>
                      {filteredCustomTags.length > 0 && (
                        <div className="mb-2 px-2 text-xs font-semibold text-[#2B2B2B]/60 uppercase tracking-wide">
                          Standaard ingrediënten
                        </div>
                      )}
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
                    </>
                  )}
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
