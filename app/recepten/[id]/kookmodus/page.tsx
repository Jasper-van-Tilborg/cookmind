'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Recipe } from '@/app/recepten/page';
import CookingModeHeader from '@/components/recepten/CookingModeHeader';
import CookingProgressBar from '@/components/recepten/CookingProgressBar';
import CookingInstructions from '@/components/recepten/CookingInstructions';
import CookingCompletionScreen from '@/components/recepten/CookingCompletionScreen';
import { parseTimerFromInstruction } from '@/lib/utils/timerParser';

export interface ActiveTimer {
  stepIndex: number;
  totalSeconds: number;
  remainingSeconds: number;
  isRunning: boolean;
  label: string;
}

export default function CookingModePage() {
  const router = useRouter();
  const params = useParams();
  const supabase = createClient();
  const recipeId = params.id as string;

  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [activeTimers, setActiveTimers] = useState<ActiveTimer[]>([]);
  const [showTimerModal, setShowTimerModal] = useState(false);
  const [showCompletion, setShowCompletion] = useState(false);

  useEffect(() => {
    const loadRecipe = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
          router.push('/onboarding');
          return;
        }

        // Load recipe and adapted recipe in parallel
        const [recipeResult, adaptedRecipeResult] = await Promise.all([
          supabase
            .from('recipes')
            .select('*')
            .eq('id', recipeId)
            .single(),
          supabase
            .from('user_recipe_adaptations')
            .select('*')
            .eq('user_id', user.id)
            .eq('original_recipe_id', recipeId)
            .maybeSingle(),
        ]);

        if (recipeResult.error) {
          throw new Error(recipeResult.error.message);
        }

        if (!recipeResult.data) {
          throw new Error('Recept niet gevonden');
        }

        // Use adapted recipe if available, otherwise use original
        let recipeData: Recipe;
        if (adaptedRecipeResult.data && !adaptedRecipeResult.error) {
          recipeData = {
            ...adaptedRecipeResult.data,
            id: recipeId, // Keep original ID
            instructions: adaptedRecipeResult.data.instructions as string[],
            ingredients: adaptedRecipeResult.data.ingredients as Recipe['ingredients'],
            prep_time: recipeResult.data.prep_time,
            servings: recipeResult.data.servings,
            difficulty: recipeResult.data.difficulty,
            image_url: recipeResult.data.image_url,
            description: adaptedRecipeResult.data.description,
          };
        } else {
          recipeData = {
            ...recipeResult.data,
            instructions: recipeResult.data.instructions as string[],
            ingredients: recipeResult.data.ingredients as Recipe['ingredients'],
          };
        }

        setRecipe(recipeData);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Fout bij laden recept';
        setError(errorMessage);
        console.error('Error loading recipe:', err);
      } finally {
        setIsLoading(false);
      }
    };

    if (recipeId) {
      loadRecipe();
    }
  }, [recipeId, router, supabase]);

  // Timer countdown effect
  useEffect(() => {
    if (activeTimers.length === 0) return;

    const interval = setInterval(() => {
      setActiveTimers((prevTimers) => {
        const updatedTimers = prevTimers
          .map((timer) => {
            if (!timer.isRunning) return timer;

            const newRemaining = Math.max(0, timer.remainingSeconds - 1);

            // Timer finished
            if (newRemaining === 0) {
              // Show notification
              if ('Notification' in window && Notification.permission === 'granted') {
                new Notification('Timer afgelopen!', {
                  body: timer.label,
                  icon: '/favicon.ico',
                });
              }

              // Play sound (optional)
              try {
                const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OSdTgwOUKjk8LZjHAY4kdfyzHksBSR3x/DdkEAKFF606euoVRQKRp/g8r5sIQUrgc7y2Yk2CBtpvfDknU4MDlCo5PC2YxwGOJHX8sx5LAUkd8fw3ZBAC');
                audio.play().catch(() => {
                  // Ignore audio play errors
                });
              } catch (e) {
                // Ignore audio errors
              }
            }

            return {
              ...timer,
              remainingSeconds: newRemaining,
            };
          })
          .filter((timer) => timer.remainingSeconds > 0 || !timer.isRunning);

        return updatedTimers;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [activeTimers.length]);

  const handleNextStep = () => {
    if (recipe) {
      if (currentStep < recipe.instructions.length - 1) {
        setCurrentStep(currentStep + 1);
      } else {
        // Last step - show completion screen
        setShowCompletion(true);
      }
    }
  };

  const handleBackToRecipe = () => {
    router.push(`/recepten/${recipeId}`);
  };

  const handlePreviousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleStartTimer = (stepIndex: number, instruction: string) => {
    const parsedTimer = parseTimerFromInstruction(instruction);
    if (!parsedTimer) return;

    // Request notification permission if not granted
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    const newTimer: ActiveTimer = {
      stepIndex,
      totalSeconds: parsedTimer.seconds,
      remainingSeconds: parsedTimer.seconds,
      isRunning: true,
      label: `Stap ${stepIndex + 1}: ${instruction.substring(0, 50)}...`,
    };

    setActiveTimers((prev) => [...prev, newTimer]);
  };

  const handleToggleTimer = (stepIndex: number) => {
    setActiveTimers((prev) =>
      prev.map((timer) =>
        timer.stepIndex === stepIndex
          ? { ...timer, isRunning: !timer.isRunning }
          : timer
      )
    );
  };

  const handleStopTimer = (stepIndex: number) => {
    setActiveTimers((prev) => prev.filter((timer) => timer.stepIndex !== stepIndex));
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#FAFAF7]">
        <p className="text-[#2B2B2B]">Laden...</p>
      </div>
    );
  }

  if (error || !recipe) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#FAFAF7] px-6">
        <p className="text-center text-[#2B2B2B]">{error || 'Recept niet gevonden'}</p>
        <button
          onClick={() => router.push(`/recepten/${recipeId}`)}
          className="mt-4 rounded-xl bg-[#1F6F54] px-6 py-3 text-white font-semibold"
        >
          Terug naar recept
        </button>
      </div>
    );
  }

  const totalSteps = recipe.instructions.length;
  const progress = ((currentStep + 1) / totalSteps) * 100;

  // Show completion screen if cooking is complete
  if (showCompletion) {
    return (
      <CookingCompletionScreen
        recipeTitle={recipe.title}
        onBackToRecipe={handleBackToRecipe}
      />
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#FAFAF7]">
      {/* Header */}
      <CookingModeHeader
        currentStep={currentStep + 1}
        totalSteps={totalSteps}
        onBack={() => router.push(`/recepten/${recipeId}`)}
        onTimerClick={() => setShowTimerModal(!showTimerModal)}
        activeTimers={activeTimers}
      />

      {/* Progress Bar */}
      <CookingProgressBar progress={progress} />

      {/* Instructions */}
      <div className="flex-1 overflow-y-auto pb-6">
        <CookingInstructions
          instructions={recipe.instructions}
          currentStep={currentStep}
          onNextStep={handleNextStep}
          onPreviousStep={handlePreviousStep}
          onStartTimer={handleStartTimer}
          activeTimers={activeTimers}
          onToggleTimer={handleToggleTimer}
          onStopTimer={handleStopTimer}
        />
      </div>

      {/* Timer Modal */}
      {showTimerModal && activeTimers.length > 0 && (
        <div className="fixed inset-0 z-50 flex items-end bg-black/50">
          <div className="w-full bg-white rounded-t-3xl p-6 max-h-[50vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-[#2B2B2B]">Actieve Timers</h3>
              <button
                onClick={() => setShowTimerModal(false)}
                className="text-[#2B2B2B]"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M18 6L6 18M6 6L18 18"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </div>
            <div className="space-y-3">
              {activeTimers.map((timer) => (
                <div
                  key={timer.stepIndex}
                  className="rounded-xl bg-[#E5E5E0] p-4"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-[#2B2B2B]">
                      {timer.label}
                    </span>
                    <button
                      onClick={() => handleStopTimer(timer.stepIndex)}
                      className="text-red-500"
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                        <path
                          d="M6 6L18 18M18 6L6 18"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                        />
                      </svg>
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-[#1F6F54]">
                      {Math.floor(timer.remainingSeconds / 60)}:{(timer.remainingSeconds % 60).toString().padStart(2, '0')}
                    </span>
                    <button
                      onClick={() => handleToggleTimer(timer.stepIndex)}
                      className="ml-auto rounded-lg bg-[#1F6F54] px-3 py-1 text-white text-sm"
                    >
                      {timer.isRunning ? 'Pauzeer' : 'Hervat'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
