'use client';

import { useEffect, useRef } from 'react';
import { ActiveTimer } from '@/app/recepten/[id]/kookmodus/page';
import { parseTimerFromInstruction, formatTimerDisplay } from '@/lib/utils/timerParser';

interface CookingInstructionsProps {
  instructions: string[];
  currentStep: number;
  onNextStep: () => void;
  onPreviousStep: () => void;
  onStartTimer: (stepIndex: number, instruction: string) => void;
  activeTimers: ActiveTimer[];
  onToggleTimer: (stepIndex: number) => void;
  onStopTimer: (stepIndex: number) => void;
}

export default function CookingInstructions({
  instructions,
  currentStep,
  onNextStep,
  onPreviousStep,
  onStartTimer,
  activeTimers,
  onToggleTimer,
  onStopTimer,
}: CookingInstructionsProps) {
  const stepRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Scroll to current step when it changes
  useEffect(() => {
    const currentStepElement = stepRefs.current[currentStep];
    if (currentStepElement) {
      currentStepElement.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  }, [currentStep]);

  const getTimerForStep = (stepIndex: number): ActiveTimer | undefined => {
    return activeTimers.find((timer) => timer.stepIndex === stepIndex);
  };

  return (
    <div className="px-6 py-4 space-y-4">
      {instructions.map((instruction, index) => {
        const isCurrentStep = index === currentStep;
        const parsedTimer = parseTimerFromInstruction(instruction);
        const activeTimer = getTimerForStep(index);

        return (
          <div
            key={index}
            ref={(el) => {
              stepRefs.current[index] = el;
            }}
            className={`rounded-xl p-4 transition-all ${
              isCurrentStep
                ? 'bg-[#E5E5E0] border-2 border-[#1F6F54]'
                : 'bg-white border border-[#E5E5E0]'
            }`}
          >
            {/* Step Number and Instruction */}
            <div className="flex items-start gap-3 mb-3">
              <div
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full font-semibold ${
                  isCurrentStep
                    ? 'bg-[#1F6F54] text-white'
                    : 'bg-[#E5E5E0] text-[#2B2B2B]'
                }`}
              >
                {index + 1}
              </div>
              <p
                className={`flex-1 text-[#2B2B2B] ${
                  isCurrentStep ? 'font-medium' : ''
                }`}
              >
                {instruction}
              </p>
            </div>

            {/* Timer Button */}
            {parsedTimer && (
              <div className="ml-11">
                {activeTimer ? (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onToggleTimer(index)}
                      className="flex items-center gap-2 rounded-xl bg-[#1F6F54] px-4 py-3 text-base text-white font-medium transition-colors hover:bg-[#1a5d47] min-h-[44px]"
                    >
                      <svg
                        width="16"
                        height="16"
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
                      <span>
                        {activeTimer.isRunning
                          ? `${Math.floor(activeTimer.remainingSeconds / 60)}:${(activeTimer.remainingSeconds % 60).toString().padStart(2, '0')}`
                          : 'Pauze'}
                      </span>
                    </button>
                    <button
                      onClick={() => onStopTimer(index)}
                      className="rounded-xl bg-red-500 px-4 py-3 text-base text-white font-medium transition-colors hover:bg-red-600 min-h-[44px]"
                    >
                      Stop
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => onStartTimer(index, instruction)}
                    className="flex items-center gap-2 rounded-xl bg-white border border-[#E5E5E0] px-4 py-3 text-base text-[#2B2B2B] font-medium transition-colors hover:bg-[#E5E5E0] min-h-[44px]"
                  >
                    <svg
                      width="16"
                      height="16"
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
                    <span>Timer ({formatTimerDisplay(parsedTimer.seconds)})</span>
                  </button>
                )}
              </div>
            )}

            {/* Navigation Buttons (only for current step) */}
            {isCurrentStep && (
              <div className="ml-11 mt-4 flex gap-2">
                <button
                  onClick={onPreviousStep}
                  disabled={index === 0}
                  className="flex-1 rounded-xl bg-white border border-[#E5E5E0] px-4 py-3 text-base text-[#2B2B2B] font-medium transition-colors hover:bg-[#E5E5E0] disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px]"
                >
                  Vorige stap
                </button>
                <button
                  onClick={onNextStep}
                  className="flex-1 rounded-xl bg-[#1F6F54] px-4 py-3 text-base font-medium text-white transition-colors hover:bg-[#1a5d47] min-h-[44px]"
                >
                  {index === instructions.length - 1 ? 'Klaar!' : 'Volgende stap'}
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
