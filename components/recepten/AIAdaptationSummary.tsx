'use client';

import { Recipe } from '@/app/recepten/page';
import { useRouter } from 'next/navigation';

interface AIAdaptationSummaryProps {
  originalRecipe: Recipe;
  adaptedRecipe: Recipe;
  aiPrompt: string;
  recipeId: string;
}

export default function AIAdaptationSummary({
  originalRecipe,
  adaptedRecipe,
  aiPrompt,
  recipeId,
}: AIAdaptationSummaryProps) {
  const router = useRouter();

  // Compare ingredients
  const originalIngredientNames = new Set(
    originalRecipe.ingredients.map((ing) => ing.name.toLowerCase())
  );
  const adaptedIngredientNames = new Set(
    adaptedRecipe.ingredients.map((ing) => ing.name.toLowerCase())
  );

  const addedIngredients = adaptedRecipe.ingredients.filter(
    (ing) => !originalIngredientNames.has(ing.name.toLowerCase())
  );
  const removedIngredients = originalRecipe.ingredients.filter(
    (ing) => !adaptedIngredientNames.has(ing.name.toLowerCase())
  );
  const modifiedIngredients = adaptedRecipe.ingredients.filter((adaptedIng) => {
    const originalIng = originalRecipe.ingredients.find(
      (orig) => orig.name.toLowerCase() === adaptedIng.name.toLowerCase()
    );
    return (
      originalIng &&
      (originalIng.amount !== adaptedIng.amount || originalIng.unit !== adaptedIng.unit)
    );
  });

  // Compare instructions
  const instructionChanged = originalRecipe.instructions.length !== adaptedRecipe.instructions.length ||
    originalRecipe.instructions.some((inst, idx) => inst !== adaptedRecipe.instructions[idx]);

  return (
    <div className="flex min-h-screen flex-col bg-[#FAFAF7]">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-[#FAFAF7] border-b border-[#E5E5E0]">
        <div className="flex items-center justify-between px-6 py-4">
          <button
            onClick={() => router.back()}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white border border-[#E5E5E0] transition-colors hover:bg-[#E5E5E0]"
            aria-label="Terug"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="text-[#1F6F54]"
            >
              <path
                d="M19 12H5M5 12L12 19M5 12L12 5"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          <h1 className="text-lg font-semibold text-[#2B2B2B]">AI Aanpassingen</h1>
          <div className="w-10" /> {/* Spacer for centering */}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 py-6">
        {/* Summary Section */}
        <div className="mb-6 rounded-xl bg-white border border-[#E5E5E0] p-4">
          <h2 className="mb-3 text-lg font-semibold text-[#2B2B2B]">Samenvatting</h2>
          <div className="space-y-2 text-sm text-[#2B2B2B]/80">
            <p>
              <span className="font-medium">Origineel recept:</span> {originalRecipe.title}
            </p>
            <p>
              <span className="font-medium">Aangepast recept:</span> {adaptedRecipe.title}
            </p>
            <p>
              <span className="font-medium">Je verzoek:</span> "{aiPrompt}"
            </p>
          </div>
        </div>

        {/* Key Changes */}
        <div className="mb-6 rounded-xl bg-white border border-[#E5E5E0] p-4">
          <h2 className="mb-3 text-lg font-semibold text-[#2B2B2B]">Belangrijkste wijzigingen</h2>
          <div className="space-y-3">
            {addedIngredients.length > 0 && (
              <div>
                <p className="mb-2 text-sm font-medium text-green-600">Toegevoegd:</p>
                <ul className="ml-4 list-disc space-y-1 text-sm text-[#2B2B2B]/80">
                  {addedIngredients.map((ing, idx) => (
                    <li key={idx}>
                      {ing.amount} {ing.unit} {ing.name}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {removedIngredients.length > 0 && (
              <div>
                <p className="mb-2 text-sm font-medium text-red-600">Verwijderd:</p>
                <ul className="ml-4 list-disc space-y-1 text-sm text-[#2B2B2B]/80">
                  {removedIngredients.map((ing, idx) => (
                    <li key={idx}>
                      {ing.amount} {ing.unit} {ing.name}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {modifiedIngredients.length > 0 && (
              <div>
                <p className="mb-2 text-sm font-medium text-blue-600">Aangepast:</p>
                <ul className="ml-4 list-disc space-y-1 text-sm text-[#2B2B2B]/80">
                  {modifiedIngredients.map((ing, idx) => {
                    const originalIng = originalRecipe.ingredients.find(
                      (orig) => orig.name.toLowerCase() === ing.name.toLowerCase()
                    );
                    return (
                      <li key={idx}>
                        {ing.name}: {originalIng?.amount} {originalIng?.unit} → {ing.amount} {ing.unit}
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
            {instructionChanged && (
              <div>
                <p className="mb-2 text-sm font-medium text-purple-600">Bereidingswijze aangepast</p>
                <p className="text-sm text-[#2B2B2B]/80">
                  De instructies zijn aangepast om aan te sluiten bij de nieuwe ingrediënten.
                </p>
              </div>
            )}
            {addedIngredients.length === 0 &&
              removedIngredients.length === 0 &&
              modifiedIngredients.length === 0 &&
              !instructionChanged && (
                <p className="text-sm text-[#2B2B2B]/60">
                  Geen significante wijzigingen gedetecteerd.
                </p>
              )}
          </div>
        </div>

        {/* Detailed Comparison */}
        <div className="mb-6 rounded-xl bg-white border border-[#E5E5E0] p-4">
          <h2 className="mb-3 text-lg font-semibold text-[#2B2B2B]">Gedetailleerde vergelijking</h2>
          
          {/* Ingredients Comparison */}
          <div className="mb-4">
            <h3 className="mb-2 text-sm font-medium text-[#2B2B2B]">Ingrediënten</h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <p className="mb-2 text-xs font-medium text-[#2B2B2B]/60">Origineel</p>
                <ul className="space-y-1 text-sm text-[#2B2B2B]/80">
                  {originalRecipe.ingredients.map((ing, idx) => (
                    <li key={idx}>
                      • {ing.amount} {ing.unit} {ing.name}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="mb-2 text-xs font-medium text-[#2B2B2B]/60">Aangepast</p>
                <ul className="space-y-1 text-sm text-[#2B2B2B]/80">
                  {adaptedRecipe.ingredients.map((ing, idx) => (
                    <li key={idx}>
                      • {ing.amount} {ing.unit} {ing.name}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Instructions Comparison */}
          <div>
            <h3 className="mb-2 text-sm font-medium text-[#2B2B2B]">Bereidingswijze</h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <p className="mb-2 text-xs font-medium text-[#2B2B2B]/60">Origineel</p>
                <ol className="space-y-2 text-sm text-[#2B2B2B]/80">
                  {originalRecipe.instructions.map((inst, idx) => (
                    <li key={idx} className="flex gap-2">
                      <span className="font-medium text-[#1F6F54]">{idx + 1}.</span>
                      <span>{inst}</span>
                    </li>
                  ))}
                </ol>
              </div>
              <div>
                <p className="mb-2 text-xs font-medium text-[#2B2B2B]/60">Aangepast</p>
                <ol className="space-y-2 text-sm text-[#2B2B2B]/80">
                  {adaptedRecipe.instructions.map((inst, idx) => (
                    <li key={idx} className="flex gap-2">
                      <span className="font-medium text-[#1F6F54]">{idx + 1}.</span>
                      <span>{inst}</span>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={() => router.push(`/recepten/${recipeId}`)}
          className="w-full rounded-xl bg-[#1F6F54] px-6 py-4 text-base font-semibold text-white transition-colors hover:bg-[#1a5d47]"
        >
          Bekijk aangepast recept
        </button>
      </div>
    </div>
  );
}
