'use client';

import { FilterType } from '@/src/types';

interface RecipeFiltersProps {
  activeFilter: FilterType;
  onFilterChange: (filter: FilterType) => void;
}

export default function RecipeFilters({ activeFilter, onFilterChange }: RecipeFiltersProps) {
  const filters: { value: FilterType; label: string }[] = [
    { value: 'all', label: 'Alle' },
    { value: 'quick', label: 'Snelle (<30min)' },
    { value: 'vegetarian', label: 'Vegetarisch' },
  ];

  return (
    <div className="flex gap-2 overflow-x-auto pb-2">
      {filters.map((filter) => (
        <button
          key={filter.value}
          onClick={() => onFilterChange(filter.value)}
          className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
            activeFilter === filter.value
              ? 'bg-purple-600 text-white'
              : 'bg-white text-gray-700 border border-gray-200'
          }`}
        >
          {filter.label}
        </button>
      ))}
    </div>
  );
}



