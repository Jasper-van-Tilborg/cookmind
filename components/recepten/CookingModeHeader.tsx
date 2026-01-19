'use client';

import { ActiveTimer } from '@/app/recepten/[id]/kookmodus/page';

interface CookingModeHeaderProps {
  currentStep: number;
  totalSteps: number;
  onBack: () => void;
  onTimerClick: () => void;
  activeTimers: ActiveTimer[];
}

export default function CookingModeHeader({
  currentStep,
  totalSteps,
  onBack,
  onTimerClick,
  activeTimers,
}: CookingModeHeaderProps) {
  const hasActiveTimers = activeTimers.length > 0;

  return (
    <div className="sticky top-0 z-20 bg-[#FAFAF7] border-b border-[#E5E5E0]">
      <div className="flex items-center justify-between px-6 py-4">
        {/* Back Button */}
        <button
          onClick={onBack}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-white border border-[#E5E5E0] transition-colors hover:bg-[#E5E5E0]"
          aria-label="Terug"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="text-[#1F6F54]"
          >
            <path
              d="M19 12H5M5 12L12 19M5 12L12 5"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        {/* Step Indicator */}
        <div className="flex-1 text-center">
          <span className="text-lg font-semibold text-[#2B2B2B]">
            Stap {currentStep} van {totalSteps}
          </span>
        </div>

        {/* Timer Button */}
        <div className="relative">
          <button
            onClick={onTimerClick}
            className={`flex h-10 w-10 items-center justify-center rounded-full border transition-colors ${
              hasActiveTimers
                ? 'bg-[#1F6F54] border-[#1F6F54] text-white'
                : 'bg-white border-[#E5E5E0] text-[#2B2B2B] hover:bg-[#E5E5E0]'
            }`}
            aria-label="Timers"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M12 6V12L16 14"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          {hasActiveTimers && (
            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-semibold text-white">
              {activeTimers.length}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
