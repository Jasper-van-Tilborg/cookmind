'use client';

import { SlidersHorizontal } from 'lucide-react';
import { FilterType } from '@/src/types';

interface RecipeFiltersProps {
  activeFilter: FilterType;
  onFilterChange: (filter: FilterType) => void;
  onOpenAdvancedFilters: () => void;
  advancedFilterCount?: number;
}

export default function RecipeFilters({ 
  activeFilter, 
  onFilterChange, 
  onOpenAdvancedFilters,
  advancedFilterCount = 0,
}: RecipeFiltersProps) {
  const filters: { value: FilterType; label: string }[] = [
    { value: 'all', label: 'Alle' },
    { value: 'quick', label: 'Snelle (<30min)' },
    { value: 'vegetarian', label: 'Vegetarisch' },
    { value: 'favorites', label: 'Favorieten' },
  ];

  return (
    <div className="flex gap-2 overflow-x-auto pb-2">
      {filters.map((filter) => (
        <button
          key={filter.value}
          onClick={() => onFilterChange(filter.value)}
          className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors touch-target ${
            activeFilter === filter.value
              ? 'bg-purple-600 text-white'
              : 'bg-white text-gray-700 border border-gray-200'
          }`}
        >
          {filter.label}
        </button>
      ))}
      <button
        onClick={onOpenAdvancedFilters}
        className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors touch-target flex items-center gap-2 ${
          advancedFilterCount > 0
            ? 'bg-purple-600 text-white'
            : 'bg-white text-gray-700 border border-gray-200'
        }`}
      >
        <SlidersHorizontal size={16} />
        Filters
        {advancedFilterCount > 0 && (
          <span className="bg-white/20 text-white text-xs font-semibold px-1.5 py-0.5 rounded-full">
            {advancedFilterCount}
          </span>
        )}
      </button>
    </div>
  );
}





