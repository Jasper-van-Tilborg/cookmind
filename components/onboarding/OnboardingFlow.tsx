'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import OnboardingStep from './OnboardingStep';
import StepIndicator from './StepIndicator';

export interface OnboardingStepData {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  description: string;
}

const onboardingSteps: OnboardingStepData[] = [
  {
    icon: (
      <Image src="/cookmind_ai_logo.svg" alt="CookMind AI" width={120} height={120} className="object-contain" />
    ),
    title: 'CookMind AI',
    subtitle: 'Van voorraad naar perfect recept',
    description: 'De revolutionaire app die jouw voorraad transformeert in heerlijke recepten. Ontdek hoe AI jouw kookervaring volledig herdefinieert. Geen verspilling meer, alleen culinaire perfectie.',
  },
  {
    icon: (
      <Image src="/voorraad_icon.svg" alt="Voorraad" width={120} height={120} className="object-contain" />
    ),
    title: 'Voorraad',
    subtitle: 'Altijd overzicht van je koelkast',
    description: 'Voeg ingrediënten toe aan je voorraad en houd bij wat je in huis hebt. Zo weet je precies welke recepten je kunt maken en voorkom je verspilling.',
  },
  {
    icon: (
      <Image src="/recepten_icon.svg" alt="Recepten" width={120} height={120} className="object-contain" />
    ),
    title: 'Recepten',
    subtitle: 'Vind het perfecte recept',
    description: 'CookMind AI matcht slimme recepten op basis van wat je in huis hebt, zodat je altijd iets lekkers kunt maken zonder extra boodschappen.',
  },
  {
    icon: (
      <Image src="/kookmodus_icon.svg" alt="Kookmodus" width={120} height={120} className="object-contain" />
    ),
    title: 'Kookmodus',
    subtitle: 'Kook met begeleiding',
    description: 'Volg stapsgewijze instructies terwijl je kookt en laat onze kookmodus je door elk recept leiden, voor een zorgeloze en overzichtelijke kookervaring.',
  },
];

export default function OnboardingFlow() {
  const [currentStep, setCurrentStep] = useState(0);
  const [direction, setDirection] = useState<'next' | 'previous'>('next');
  const [isAnimating, setIsAnimating] = useState(false);
  const router = useRouter();

  const handleNext = () => {
    if (currentStep < onboardingSteps.length - 1) {
      setDirection('next');
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentStep(currentStep + 1);
        setIsAnimating(false);
      }, 250);
    } else {
      // Complete onboarding
      sessionStorage.setItem('onboarding_completed', 'true');
      router.push('/login');
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setDirection('previous');
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentStep(currentStep - 1);
        setIsAnimating(false);
      }, 250);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#FAFAF7] px-6 py-8">
      <div className="relative w-full max-w-md overflow-hidden">
        <OnboardingStep
          key={currentStep}
          step={onboardingSteps[currentStep]}
          isFirstStep={currentStep === 0}
          isLastStep={currentStep === onboardingSteps.length - 1}
          currentStep={currentStep}
          totalSteps={onboardingSteps.length}
          direction={direction}
          isAnimating={isAnimating}
          onNext={handleNext}
          onPrevious={handlePrevious}
        />
      </div>
    </div>
  );
}
