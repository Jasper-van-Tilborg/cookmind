'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { X, ChevronLeft, ChevronRight, Check } from 'lucide-react';
import CookingStep from '@/src/components/cooking/CookingStep';
import { Recipe } from '@/src/types';
import { mockRecipes } from '@/src/lib/data';

export default function CookingModePage() {
  const params = useParams();
  const router = useRouter();
  const recipeId = Number(params.id);
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const foundRecipe = mockRecipes.find(r => r.id === recipeId);
    if (foundRecipe) {
      setRecipe(foundRecipe);
    }
  }, [recipeId]);

  if (!recipe) {
    return (
      <div className="p-4">
        <p>Recept niet gevonden</p>
      </div>
    );
  }

  const totalSteps = recipe.steps.length;
  const progress = ((currentStep + 1) / totalSteps) * 100;

  const handleNext = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Finished cooking
      router.push(`/recipes/${recipe.id}?finished=true`);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleClose = () => {
    if (confirm('Weet je zeker dat je de kookmodus wilt verlaten?')) {
      router.push(`/recipes/${recipe.id}`);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-900 z-50 flex flex-col">
      {/* Header with Progress */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between mb-2">
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Sluiten"
          >
            <X size={24} />
          </button>
          <h2 className="font-semibold text-gray-800">{recipe.title}</h2>
          <div className="w-10" /> {/* Spacer for centering */}
        </div>
        
        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-purple-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-xs text-gray-500 mt-1 text-center">
          Stap {currentStep + 1} van {totalSteps}
        </p>
      </div>

      {/* Cooking Step Content */}
      <div className="flex-1 overflow-y-auto bg-gray-50">
        <CookingStep
          stepNumber={currentStep + 1}
          instruction={recipe.steps[currentStep]}
          isActive={true}
        />
      </div>

      {/* Navigation Footer */}
      <div className="bg-white border-t border-gray-200 px-4 py-4">
        <div className="flex gap-3 max-w-md mx-auto">
          <button
            onClick={handlePrevious}
            disabled={currentStep === 0}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-medium transition-colors ${
              currentStep === 0
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            <ChevronLeft size={20} />
            Vorige
          </button>
          <button
            onClick={handleNext}
            className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-medium bg-purple-600 text-white hover:bg-purple-700 transition-colors"
          >
            {currentStep === totalSteps - 1 ? (
              <>
                <Check size={20} />
                Klaar!
              </>
            ) : (
              <>
                Volgende
                <ChevronRight size={20} />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}



