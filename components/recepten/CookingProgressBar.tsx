'use client';

interface CookingProgressBarProps {
  progress: number; // 0-100
}

export default function CookingProgressBar({ progress }: CookingProgressBarProps) {
  const clampedProgress = Math.max(0, Math.min(100, progress));

  return (
    <div className="w-full h-2 bg-[#9FC5B5]">
      <div
        className="h-full bg-[#1F6F54] transition-all duration-300 ease-out"
        style={{ width: `${clampedProgress}%` }}
      />
    </div>
  );
}
