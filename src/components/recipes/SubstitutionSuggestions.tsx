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
    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
      <h3 className="text-sm font-semibold text-blue-800 mb-3">
        AI suggesties voor {originalIngredient}:
      </h3>
      <div className="space-y-3">
        {substitutions.map((sub, index) => (
          <div
            key={index}
            className={`p-3 bg-white rounded-lg border-2 transition-colors ${
              acceptedIndex === index
                ? 'border-green-300 bg-green-50'
                : 'border-blue-200'
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium text-gray-800">
                    {sub.substitute}
                  </span>
                  <span className="text-xs text-gray-500">in plaats van</span>
                  <span className="text-sm text-gray-600 line-through">
                    {sub.original}
                  </span>
                </div>
                <p className="text-xs text-gray-600 mb-2">{sub.reason}</p>
                {sub.adjustments && (
                  <p className="text-xs text-blue-600 italic">
                    💡 {sub.adjustments}
                  </p>
                )}
              </div>
              {acceptedIndex === null && (
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => {
                      setAcceptedIndex(index);
                      onAccept(sub);
                    }}
                    className="p-1.5 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
                    title="Accepteer"
                  >
                    <Check size={16} />
                  </button>
                  {onReject && (
                    <button
                      onClick={onReject}
                      className="p-1.5 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                      title="Weiger"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>
              )}
              {acceptedIndex === index && (
                <div className="flex items-center gap-1 text-green-600 flex-shrink-0">
                  <Check size={16} />
                  <span className="text-xs font-medium">Geaccepteerd</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

