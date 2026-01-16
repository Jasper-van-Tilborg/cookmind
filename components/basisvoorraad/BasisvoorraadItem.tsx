'use client';

interface BasisvoorraadItemProps {
  id: string;
  name: string;
  isSelected: boolean;
  onToggle: (id: string) => void;
}

export default function BasisvoorraadItem({
  id,
  name,
  isSelected,
  onToggle,
}: BasisvoorraadItemProps) {
  return (
    <button
      onClick={() => onToggle(id)}
      className="flex w-full items-center gap-3 rounded-lg p-3 transition-colors hover:bg-[#FAFAF7]"
    >
      {/* Checkbox */}
      <div
        className={`flex h-6 w-6 flex-shrink-0 items-center justify-center rounded border-2 transition-colors ${
          isSelected
            ? 'border-[#1F6F54] bg-[#1F6F54]'
            : 'border-[#E5E5E0] bg-[#E5E5E0]'
        }`}
      >
        {isSelected && (
          <svg
            className="h-4 w-4 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={3}
              d="M5 13l4 4L19 7"
            />
          </svg>
        )}
      </div>

      {/* Product name */}
      <span className="text-left text-base text-[#2B2B2B]">{name}</span>
    </button>
  );
}
