interface MatchBadgeProps {
  percentage: number;
  size?: 'sm' | 'md' | 'lg';
}

export default function MatchBadge({ percentage, size = 'md' }: MatchBadgeProps) {
  const getColor = () => {
    if (percentage === 100) return 'bg-green-500 text-white';
    if (percentage >= 80) return 'bg-yellow-500 text-white';
    return 'bg-gray-400 text-white';
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'text-xs px-2 py-1';
      case 'lg':
        return 'text-base px-4 py-2';
      default:
        return 'text-sm px-3 py-1.5';
    }
  };

  return (
    <span
      className={`inline-flex items-center rounded-full font-semibold ${getColor()} ${getSizeClasses()}`}
    >
      {percentage}% match
    </span>
  );
}




