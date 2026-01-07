'use client';

import { useState } from 'react';
import { Check, X, Loader2 } from 'lucide-react';
import { Substitution } from '@/src/types';

interface SubstitutionSuggestionsProps {
  originalIngredient: string;
  substitutions: Substitution[];
  loading?: boolean;
  onAccept: (substitution: Substitution) => void;
  onReject?: () => void;
}

export default function SubstitutionSuggestions({
  originalIngredient,
  substitutions,
  loading = false,
  onAccept,
  onReject,
}: SubstitutionSuggestionsProps) {
  const [acceptedIndex, setAcceptedIndex] = useState<number | null>(null);

  if (loading) {
    return (
      <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
        <div className="flex items-center gap-2 text-blue-700">
          <Loader2 size={16} className="animate-spin" />
          <span className="text-sm font-medium">AI zoekt substituties...</span>
        </div>
      </div>
    );
  }

  if (substitutions.length === 0) {
    return (
      <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
        <p className="text-sm text-yellow-700">
          Geen substituties gevonden voor {originalIngredient}
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-5 bg-blue-50 rounded-lg border border-blue-200">
      <h3 className="text-sm sm:text-base font-semibold text-blue-800 mb-3 sm:mb-4">
        AI suggesties voor <span className="text-purple-600">{originalIngredient}</span>:
      </h3>
      <div className="space-y-3 sm:space-y-4">
        {substitutions.map((sub, index) => (
          <div
            key={index}
            className={`p-3 sm:p-4 bg-white rounded-lg border-2 transition-colors ${
              acceptedIndex === index
                ? 'border-green-300 bg-green-50'
                : 'border-blue-200'
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-2">
                  <span className="text-sm sm:text-base font-medium text-gray-800">
                    {sub.substitute}
                  </span>
                  <span className="text-xs text-gray-500">in plaats van</span>
                  <span className="text-sm text-gray-600 line-through">
                    {sub.original}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-gray-600 mb-2 leading-relaxed">{sub.reason}</p>
                {sub.adjustments && (
                  <p className="text-xs sm:text-sm text-blue-600 italic">
                    💡 {sub.adjustments}
                  </p>
                )}
              </div>
              {acceptedIndex === null && (
                <div className="flex items-center gap-2 flex-shrink-0 sm:self-start">
                  <button
                    onClick={() => {
                      setAcceptedIndex(index);
                      onAccept(sub);
                    }}
                    className="p-2.5 sm:p-2 bg-green-500 text-white rounded-lg active:bg-green-600 transition-colors touch-target"
                    title="Accepteer"
                    aria-label="Accepteer substitutie"
                  >
                    <Check size={18} className="sm:w-4 sm:h-4" />
                  </button>
                  {onReject && (
                    <button
                      onClick={onReject}
                      className="p-2.5 sm:p-2 bg-red-500 text-white rounded-lg active:bg-red-600 transition-colors touch-target"
                      title="Weiger"
                      aria-label="Weiger substitutie"
                    >
                      <X size={18} className="sm:w-4 sm:h-4" />
                    </button>
                  )}
                </div>
              )}
              {acceptedIndex === index && (
                <div className="flex items-center gap-2 text-green-600 flex-shrink-0 sm:self-start">
                  <Check size={18} className="sm:w-4 sm:h-4" />
                  <span className="text-xs sm:text-sm font-medium">Geaccepteerd</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}


