'use client';

interface ServingSizeSelectorProps {
  multiplier: number;
  onMultiplierChange: (multiplier: number) => void;
}

export default function ServingSizeSelector({
  multiplier,
  onMultiplierChange,
}: ServingSizeSelectorProps) {
  const handleDecrease = () => {
    if (multiplier > 1) {
      onMultiplierChange(multiplier - 1);
    }
  };

  const handleIncrease = () => {
    onMultiplierChange(multiplier + 1);
  };

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handleDecrease}
        disabled={multiplier <= 1}
        className="flex h-10 w-10 items-center justify-center rounded-xl bg-white border border-[#E5E5E0] text-[#2B2B2B] transition-colors hover:bg-[#E5E5E0] disabled:opacity-50 disabled:cursor-not-allowed"
        aria-label="Verminder aantal personen"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M5 12H19"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      <div className="flex h-10 min-w-[60px] items-center justify-center rounded-xl bg-white border border-[#E5E5E0] px-3">
        <span className="text-sm font-medium text-[#2B2B2B]">{multiplier}x</span>
      </div>

      <button
        onClick={handleIncrease}
        className="flex h-10 w-10 items-center justify-center rounded-xl bg-white border border-[#E5E5E0] text-[#2B2B2B] transition-colors hover:bg-[#E5E5E0]"
        aria-label="Vermeerder aantal personen"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M12 5V19M5 12H19"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      <span className="text-sm text-[#2B2B2B]">Personen</span>
    </div>
  );
}
