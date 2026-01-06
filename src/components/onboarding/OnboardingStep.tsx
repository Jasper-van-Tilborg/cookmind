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
    <div className="flex flex-col h-screen">
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        <h2 className="text-2xl font-bold mb-4">{title}</h2>
        <p className="text-gray-600 text-center mb-8">{description}</p>
      </div>
      
      <div className="p-6">
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


