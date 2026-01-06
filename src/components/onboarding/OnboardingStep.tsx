interface OnboardingStepProps {
  title: string;
  description: string;
  stepNumber: number;
  totalSteps: number;
  onNext: () => void;
  isLastStep?: boolean;
}

export default function OnboardingStep({
  title,
  description,
  stepNumber,
  totalSteps,
  onNext,
  isLastStep = false,
}: OnboardingStepProps) {
  return (
    <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-4 min-h-0">
        <h2 className="text-xl sm:text-2xl font-bold mb-3 text-center">{title}</h2>
        <p className="text-sm sm:text-base text-gray-600 text-center leading-relaxed">{description}</p>
      </div>
      
      <div className="p-6 pt-4 flex-shrink-0">
        <button
          onClick={onNext}
          className="w-full bg-purple-600 text-white py-3 px-4 rounded-lg font-medium"
        >
          {isLastStep ? 'Ga verder' : 'Volgende'}
        </button>
      </div>
    </div>
  );
}


