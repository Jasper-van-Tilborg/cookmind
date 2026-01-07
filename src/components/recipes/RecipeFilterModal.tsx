'use client';

import { useState, useEffect } from 'react';
import { X, Filter, SlidersHorizontal } from 'lucide-react';
import { AdvancedFilters } from '@/src/types';

interface RecipeFilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  filters: AdvancedFilters;
  onApplyFilters: (filters: AdvancedFilters) => void;
  onClearFilters: () => void;
}

export default function RecipeFilterModal({
  isOpen,
  onClose,
  filters,
  onApplyFilters,
  onClearFilters,
}: RecipeFilterModalProps) {
  const [localFilters, setLocalFilters] = useState<AdvancedFilters>(filters);

  useEffect(() => {
    if (isOpen) {
      setLocalFilters(filters);
    }
  }, [isOpen, filters]);

  if (!isOpen) return null;

  const activeFilterCount = 
    (localFilters.timeRange ? 1 : 0) +
    (localFilters.difficulty?.length || 0) +
    (localFilters.cuisine?.length || 0) +
    (localFilters.diet?.length || 0) +
    (localFilters.missingOne ? 1 : 0);

  const handleTimeRangeChange = (type: 'min' | 'max', value: number) => {
    setLocalFilters({
      ...localFilters,
      timeRange: {
        min: localFilters.timeRange?.min || 0,
        max: localFilters.timeRange?.max || 120,
        [type]: value,
      },
    });
  };

  const handleDifficultyToggle = (difficulty: 'Makkelijk' | 'Gemiddeld' | 'Moeilijk') => {
    const current = localFilters.difficulty || [];
    const newDifficulty = current.includes(difficulty)
      ? current.filter(d => d !== difficulty)
      : [...current, difficulty];
    setLocalFilters({
      ...localFilters,
      difficulty: newDifficulty.length > 0 ? newDifficulty : undefined,
    });
  };

  const handleCuisineToggle = (cuisine: string) => {
    const current = localFilters.cuisine || [];
    const newCuisine = current.includes(cuisine)
      ? current.filter(c => c !== cuisine)
      : [...current, cuisine];
    setLocalFilters({
      ...localFilters,
      cuisine: newCuisine.length > 0 ? newCuisine : undefined,
    });
  };

  const handleDietToggle = (diet: 'vegetarisch' | 'vegan' | 'glutenvrij' | 'lactosevrij') => {
    const current = localFilters.diet || [];
    const newDiet = current.includes(diet)
      ? current.filter(d => d !== diet)
      : [...current, diet];
    setLocalFilters({
      ...localFilters,
      diet: newDiet.length > 0 ? newDiet : undefined,
    });
  };

  const handleApply = () => {
    onApplyFilters(localFilters);
    onClose();
  };

  const handleClear = () => {
    const emptyFilters: AdvancedFilters = {};
    setLocalFilters(emptyFilters);
    onClearFilters();
  };

  const cuisines = ['Italiaans', 'Aziatisch', 'Mexicaans', 'Frans', 'Mediterraans', 'Amerikaans'];

  return (
    <div 
      className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center"
      onClick={onClose}
    >
      <div 
        className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center gap-2">
            <SlidersHorizontal size={24} className="text-purple-600" />
            <h2 className="text-xl font-bold text-gray-800">Filters</h2>
            {activeFilterCount > 0 && (
              <span className="bg-purple-600 text-white text-xs font-semibold px-2 py-1 rounded-full">
                {activeFilterCount}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors touch-target"
            aria-label="Sluiten"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* Time Range */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Bereidingstijd</h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-gray-600 mb-1 block">Minimum (minuten)</label>
                <input
                  type="range"
                  min="0"
                  max="120"
                  step="5"
                  value={localFilters.timeRange?.min || 0}
                  onChange={(e) => handleTimeRangeChange('min', Number(e.target.value))}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>0</span>
                  <span className="font-semibold text-purple-600">
                    {localFilters.timeRange?.min || 0} min
                  </span>
                  <span>120</span>
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-600 mb-1 block">Maximum (minuten)</label>
                <input
                  type="range"
                  min="0"
                  max="120"
                  step="5"
                  value={localFilters.timeRange?.max || 120}
                  onChange={(e) => handleTimeRangeChange('max', Number(e.target.value))}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>0</span>
                  <span className="font-semibold text-purple-600">
                    {localFilters.timeRange?.max || 120} min
                  </span>
                  <span>120</span>
                </div>
              </div>
            </div>
          </div>

          {/* Difficulty */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Moeilijkheidsgraad</h3>
            <div className="flex flex-wrap gap-2">
              {(['Makkelijk', 'Gemiddeld', 'Moeilijk'] as const).map((difficulty) => (
                <button
                  key={difficulty}
                  onClick={() => handleDifficultyToggle(difficulty)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors touch-target ${
                    localFilters.difficulty?.includes(difficulty)
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {difficulty}
                </button>
              ))}
            </div>
          </div>

          {/* Cuisine */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Keuken</h3>
            <div className="flex flex-wrap gap-2">
              {cuisines.map((cuisine) => (
                <button
                  key={cuisine}
                  onClick={() => handleCuisineToggle(cuisine)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors touch-target ${
                    localFilters.cuisine?.includes(cuisine)
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {cuisine}
                </button>
              ))}
            </div>
          </div>

          {/* Diet */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Dieet</h3>
            <div className="flex flex-wrap gap-2">
              {(['vegetarisch', 'vegan', 'glutenvrij', 'lactosevrij'] as const).map((diet) => (
                <button
                  key={diet}
                  onClick={() => handleDietToggle(diet)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors touch-target ${
                    localFilters.diet?.includes(diet)
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {diet.charAt(0).toUpperCase() + diet.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Missing One Ingredient */}
          <div>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={localFilters.missingOne || false}
                onChange={(e) =>
                  setLocalFilters({
                    ...localFilters,
                    missingOne: e.target.checked || undefined,
                  })
                }
                className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500"
              />
              <span className="text-sm font-medium text-gray-700">
                Ontbreekt slechts 1 ingrediënt
              </span>
            </label>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-4 flex gap-3 flex-shrink-0">
          <button
            onClick={handleClear}
            className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors touch-target"
          >
            Wissen
          </button>
          <button
            onClick={handleApply}
            className="flex-1 px-4 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors touch-target"
          >
            Toepassen
          </button>
        </div>
      </div>
    </div>
  );
}


