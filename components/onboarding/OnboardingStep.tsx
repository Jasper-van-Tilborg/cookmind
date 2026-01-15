'use client';

import { useEffect, useState } from 'react';
import { OnboardingStepData } from './OnboardingFlow';
import StepIndicator from './StepIndicator';

interface OnboardingStepProps {
  step: OnboardingStepData;
  isFirstStep: boolean;
  isLastStep: boolean;
  currentStep: number;
  totalSteps: number;
  direction?: 'next' | 'previous';
  isAnimating?: boolean;
  onNext: () => void;
  onPrevious: () => void;
}

export default function OnboardingStep({
  step,
  isFirstStep,
  isLastStep,
  currentStep,
  totalSteps,
  direction = 'next',
  isAnimating = false,
  onNext,
  onPrevious,
}: OnboardingStepProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Trigger fade in animation when step changes
    setIsVisible(false);
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 100);
    return () => clearTimeout(timer);
  }, [currentStep]);

  return (
    <div
      className={`flex w-full flex-col items-center transition-all duration-500 ease-out ${
        isVisible && !isAnimating
          ? 'opacity-100 translate-y-0'
          : direction === 'next'
            ? 'opacity-0 translate-y-6'
            : 'opacity-0 -translate-y-6'
      }`}
    >
      {/* Gradient Background with Icon */}
      <div className="relative mb-6 flex h-64 w-full items-center justify-center">
        <div className="absolute inset-0 flex items-center justify-center">
          <div
            className="h-[400px] w-[400px] rounded-full opacity-40"
            style={{
              background: 'radial-gradient(circle, #9FC5B5 0%, transparent 70%)',
            }}
          />
        </div>
        <div className="relative z-10 flex items-center justify-center">{step.icon}</div>
      </div>

      {/* Step Indicator */}
      <div className="mb-8">
        <StepIndicator currentStep={currentStep} totalSteps={totalSteps} />
      </div>

      {/* Content */}
      <div className="mb-12 flex w-full flex-col items-center text-center">
        <h1 className="mb-2 text-3xl font-bold text-[#1F6F54]">
          {step.title}
        </h1>
        <h2 className="mb-6 text-xl font-semibold text-[#2B2B2B]">
          {step.subtitle}
        </h2>
        <p className="text-base leading-relaxed text-[#2B2B2B]">
          {step.description}
        </p>
      </div>

      {/* Navigation Buttons */}
      <div className="flex w-full gap-4">
        {!isFirstStep && (
          <button
            onClick={onPrevious}
            className="flex flex-1 items-center justify-center rounded-xl border-2 border-[#2B2B2B] bg-[#FAFAF7] px-6 py-4 text-base font-semibold text-[#2B2B2B] transition-colors hover:bg-[#E5E5E0]"
          >
            Vorige
          </button>
        )}
        <button
          onClick={onNext}
          className={`flex items-center justify-center rounded-xl bg-[#1F6F54] px-6 py-4 text-base font-semibold text-[#FAFAF7] shadow-lg transition-colors hover:bg-[#1a5d47] ${
            isFirstStep ? 'w-full' : 'flex-1'
          }`}
        >
          Volgende
        </button>
      </div>
    </div>
  );
}
