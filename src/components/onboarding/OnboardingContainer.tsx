'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import OnboardingStep from './OnboardingStep';

const onboardingSteps = [
  {
    title: 'Welkom bij CookMind AI',
    description: 'De revolutionaire app die jouw voorraad transformeert in perfecte recepten. Ontdek hoe AI jouw kookervaring volledig herdefinieert - geen verspilling meer, alleen culinaire perfectie.',
  },
  {
    title: 'Voeg je voorraad toe',
    description: 'Voeg ingrediënten toe aan je voorraad en houd bij wat je in huis hebt.',
  },
  {
    title: 'Vind perfecte recepten',
    description: 'CookMind AI matcht recepten op basis van wat je in voorraad hebt.',
  },
  {
    title: 'Kook met begeleiding',
    description: 'Volg stapsgewijze instructies terwijl je kookt met onze kookmodus.',
  },
];

export default function OnboardingContainer() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);

  const handleNext = () => {
    if (currentStep < onboardingSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Markeer onboarding als gezien
      if (typeof window !== 'undefined') {
        localStorage.setItem('cookmind-onboarding-seen', 'true');
      }
      // Ga naar login pagina
      router.push('/auth/login');
    }
  };

  const progress = ((currentStep + 1) / onboardingSteps.length) * 100;
  const currentStepData = onboardingSteps[currentStep];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Progress bar */}
      <div className="w-full bg-gray-200 h-1">
        <div
          className="bg-purple-600 h-1 transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
      <div className="p-4 text-sm text-gray-500 text-center">
        Stap {currentStep + 1} van {onboardingSteps.length}
      </div>

      {/* Current step */}
      <OnboardingStep
        title={currentStepData.title}
        description={currentStepData.description}
        stepNumber={currentStep + 1}
        totalSteps={onboardingSteps.length}
        onNext={handleNext}
        isLastStep={currentStep === onboardingSteps.length - 1}
      />
    </div>
  );
}

