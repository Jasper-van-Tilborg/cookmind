'use client';

import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { VariantCheckResult } from '@/src/types';

interface VariantMessageProps {
  variant: VariantCheckResult;
  onAddVariant?: () => void;
}

export default function VariantMessage({ variant, onAddVariant }: VariantMessageProps) {
  if (!variant.message) return null;

  const isAcceptable = variant.acceptable && !variant.needsVariant;

  return (
    <div
      className={`p-4 rounded-lg border-2 mb-3 ${
        isAcceptable
          ? 'bg-green-50 border-green-200'
          : 'bg-yellow-50 border-yellow-200'
      }`}
    >
      <div className="flex items-start gap-3">
        {isAcceptable ? (
          <CheckCircle2 size={20} className="text-green-600 flex-shrink-0 mt-0.5" />
        ) : (
          <AlertCircle size={20} className="text-yellow-600 flex-shrink-0 mt-0.5" />
        )}
        <div className="flex-1">
          <p className="text-sm text-gray-800 leading-relaxed">{variant.message}</p>
          {variant.needsVariant && onAddVariant && (
            <button
              onClick={onAddVariant}
              className="mt-2 text-sm text-purple-600 font-medium hover:text-purple-700 underline"
            >
              Voeg {variant.variant} toe aan voorraad
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

