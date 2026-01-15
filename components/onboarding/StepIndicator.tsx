'use client';

interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
}

export default function StepIndicator({ currentStep, totalSteps }: StepIndicatorProps) {
  return (
    <div className="mt-8 flex gap-2">
      {Array.from({ length: totalSteps }).map((_, index) => (
        <div
          key={index}
          className={`h-2 w-2 rounded-full transition-colors ${
            index === currentStep
              ? 'bg-[#1F6F54]'
              : 'bg-[#E5E5E0]'
          }`}
        />
      ))}
    </div>
  );
}
