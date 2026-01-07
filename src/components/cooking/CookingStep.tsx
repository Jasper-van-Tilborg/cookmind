'use client';

import { Clock, ChefHat } from 'lucide-react';

interface CookingStepProps {
  stepNumber: number;
  instruction: string;
  ingredients?: string[];
  timeNeeded?: number; // in minuten
  isActive: boolean;
}

export default function CookingStep({
  stepNumber,
  instruction,
  ingredients = [],
  timeNeeded,
  isActive,
}: CookingStepProps) {
  if (!isActive) return null;

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-6">
      <div className="bg-white rounded-2xl p-8 shadow-lg w-full max-w-md">
        {/* Step Number Badge */}
        <div className="flex items-center justify-center mb-6">
          <div className="w-16 h-16 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold text-2xl">
            {stepNumber}
          </div>
        </div>

        {/* Instruction */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">{instruction}</h2>
        </div>

        {/* Ingredients for this step */}
        {ingredients.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-600 mb-2 flex items-center gap-2">
              <ChefHat size={16} />
              Benodigde ingrediënten:
            </h3>
            <ul className="list-disc list-inside space-y-1 text-gray-700">
              {ingredients.map((ing, index) => (
                <li key={index} className="text-sm">{ing}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Timer */}
        {timeNeeded && timeNeeded > 0 && (
          <div className="flex items-center justify-center gap-2 text-purple-600 mb-4">
            <Clock size={20} />
            <span className="font-semibold">{timeNeeded} minuten</span>
          </div>
        )}
      </div>
    </div>
  );
}




