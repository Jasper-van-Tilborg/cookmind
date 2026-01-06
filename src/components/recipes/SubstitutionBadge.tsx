'use client';

import { Sparkles } from 'lucide-react';

interface SubstitutionBadgeProps {
  onClick: (e: React.MouseEvent) => void;
  loading?: boolean;
}

export default function SubstitutionBadge({ onClick, loading = false }: SubstitutionBadgeProps) {
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onClick(e);
      }}
      disabled={loading}
      className="inline-flex items-center gap-1 text-xs text-purple-600 hover:text-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      title="Wat kan AI?"
    >
      <Sparkles size={14} className={loading ? 'animate-pulse' : ''} />
      <span className="font-medium">Wat kan AI?</span>
    </button>
  );
}

