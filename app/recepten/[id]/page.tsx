'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/client';
import { Recipe, RecipeWithMatch } from '@/app/recepten/page';
import { InventoryItem } from '@/components/voorraad/ProductCard';
import RecipeDetailHeader from '@/components/recepten/RecipeDetailHeader';
import ServingSizeSelector from '@/components/recepten/ServingSizeSelector';
import IngredientsList from '@/components/recepten/IngredientsList';
import RecipeAIModal from '@/components/recepten/RecipeAIModal';
import BottomNav from '@/components/navigation/BottomNav';

export default function RecipeDetailPage() {
  const router = useRouter();
  const params = useParams();
  const supabase = createClient();
  const recipeId = params.id as string;

  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [originalRecipe, setOriginalRecipe] = useState<Recipe | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [basicInventory, setBasicInventory] = useState<Set<string>>(new Set());
  const [servingMultiplier, setServingMultiplier] = useState(2);
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [aiInitialPrompt, setAiInitialPrompt] = useState<string | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isAdapted, setIsAdapted] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
          router.push('/onboarding');
          return;
        }

        // Load recipe, inventory and adapted recipe in parallel
        const [recipeResult, inventoryResult, adaptedRecipeResult] = await Promise.all([
          supabase
            .from('recipes')
            .select('*')
            .eq('id', recipeId)
            .single(),
          supabase
            .from('inventory')
            .select('*')
            .eq('user_id', user.id),
          supabase
            .from('user_recipe_adaptations')
            .select('*')
            .eq('user_id', user.id)
            .eq('original_recipe_id', recipeId)
            .maybeSingle(),
        ]);

        // Load basic inventory from localStorage
        const loadBasicInventory = () => {
          try {
            const stored = localStorage.getItem('cookmind_basic_inventory');
            if (stored) {
              const ids = JSON.parse(stored) as string[];
              return new Set(ids);
            }
          } catch (error) {
            console.error('Error loading basic inventory from localStorage:', error);
          }
          return new Set<string>();
        };
        const basicInventorySet = loadBasicInventory();

        if (recipeResult.error) {
          throw new Error(recipeResult.error.message);
        }

        if (!recipeResult.data) {
          throw new Error('Recept niet gevonden');
        }

        // Always store original recipe
        const originalData: Recipe = {
          ...recipeResult.data,
          instructions: recipeResult.data.instructions as string[],
          ingredients: recipeResult.data.ingredients as Recipe['ingredients'],
        };
        setOriginalRecipe(originalData);

        // Check if there's an adapted version
        if (adaptedRecipeResult.data && !adaptedRecipeResult.error) {
          const adaptedData = {
            ...adaptedRecipeResult.data,
            id: recipeId, // Keep original ID for navigation
            instructions: adaptedRecipeResult.data.instructions as string[],
            ingredients: adaptedRecipeResult.data.ingredients as Recipe['ingredients'],
            prep_time: recipeResult.data.prep_time, // Keep original prep time
            servings: recipeResult.data.servings,
            difficulty: recipeResult.data.difficulty,
            image_url: recipeResult.data.image_url, // Keep original image
          };
          setRecipe(adaptedData);
          setIsAdapted(true);
        } else {
          setRecipe(originalData);
          setIsAdapted(false);
        }
        setInventory(inventoryResult.data || []);
        setBasicInventory(basicInventorySet);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Fout bij laden recept';
        setError(errorMessage);
        console.error('Error loading recipe:', err);
      } finally {
        setIsLoading(false);
      }
    };

    if (recipeId) {
      loadData();
    }
  }, [recipeId, router, supabase]);

  // Check for AI demo query parameter
  useEffect(() => {
    if (typeof window !== 'undefined' && recipe) {
      const params = new URLSearchParams(window.location.search);
      if (params.get('ai-demo') === 'true') {
        setAiInitialPrompt('Maak het vegetarisch');
        setIsAIModalOpen(true);
        // Remove query parameter from URL
        window.history.replaceState({}, '', `/recepten/${recipeId}`);
      }
    }
  }, [recipe, recipeId]);

  const calculateMatch = (): { matchPercentage: number; missingIngredients: string[] } => {
    if (!recipe || recipe.ingredients.length === 0) {
      return { matchPercentage: 0, missingIngredients: [] };
    }

    const inventoryTags = new Set(
      inventory
        .map((item) => item.ingredient_tag)
        .filter((tag): tag is string => tag !== null && tag !== undefined)
    );

    const missingIngredients: string[] = [];
    let matchedCount = 0;

    recipe.ingredients.forEach((ingredient) => {
      if (!ingredient.ingredient_tag) {
        return;
      }

      const hasInInventory = inventoryTags.has(ingredient.ingredient_tag);
      const hasInBasic = basicInventory.has(ingredient.ingredient_tag);

      if (hasInInventory || hasInBasic) {
        matchedCount++;
      } else {
        missingIngredients.push(ingredient.name);
      }
    });

    const matchPercentage = Math.round((matchedCount / recipe.ingredients.length) * 100);

    return { matchPercentage, missingIngredients };
  };

  const { matchPercentage, missingIngredients } = calculateMatch();
  const hasAllIngredients = missingIngredients.length === 0;

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
          onClick={() => router.push('/recepten')}
          className="mt-4 rounded-xl bg-[#1F6F54] px-6 py-3 text-white font-semibold"
        >
          Terug naar recepten
        </button>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#FAFAF7]">
      {/* Header with Image */}
      <div className="relative h-64 w-full">
        {recipe.image_url ? (
          <Image
            src={recipe.image_url}
            alt={recipe.title}
            fill
            className="object-cover"
          />
        ) : (
          <div className="h-full w-full bg-[#E5E5E0] flex items-center justify-center">
            <svg
              width="64"
              height="64"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="text-[#2B2B2B]/40"
            >
              <path
                d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15M21 15L12 6L3 15M21 15H3"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        )}

        {/* Back Button */}
        <RecipeDetailHeader
          onBack={() => router.push('/recepten')}
          isFavorite={isFavorite}
          onFavoriteToggle={() => setIsFavorite(!isFavorite)}
        />
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto pb-20">
        <div className="px-6 py-4">
          {/* Title */}
          <div className="flex items-center gap-2 mb-4">
            <h1 className={`text-2xl font-bold ${isAdapted && originalRecipe && originalRecipe.title !== recipe.title
                ? 'text-[#1F6F54]'
                : 'text-[#2B2B2B]'
              }`}>
              {recipe.title}
            </h1>
            {isAdapted && (
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="text-yellow-400 shrink-0"
                aria-label="AI-aangepast recept"
              >
                <path
                  d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
                  fill="currentColor"
                />
              </svg>
            )}
          </div>

          {/* Description if changed */}
          {isAdapted && originalRecipe && recipe.description &&
            originalRecipe.description !== recipe.description && (
              <div className="mb-4 rounded-xl bg-[#D6EDE2] border-2 border-[#1F6F54] p-4">
                <p className="text-[#1F6F54] font-medium">{recipe.description}</p>
              </div>
            )}

          {/* Original description if recipe description is null but original had one */}
          {isAdapted && originalRecipe && !recipe.description && originalRecipe.description && (
            <div className="mb-4 rounded-xl bg-white border border-[#E5E5E0] p-4">
              <p className="text-[#2B2B2B]">{originalRecipe.description}</p>
            </div>
          )}

          {/* Description if not adapted */}
          {!isAdapted && recipe.description && (
            <p className="mb-4 text-[#2B2B2B]/80">{recipe.description}</p>
          )}

          {/* Serving Size and Prep Time */}
          <div className="flex items-center gap-4 mb-6">
            <ServingSizeSelector
              multiplier={servingMultiplier}
              onMultiplierChange={setServingMultiplier}
            />
            <div className="flex items-center gap-2 rounded-xl bg-white border border-[#E5E5E0] px-4 py-2">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="text-[#2B2B2B]"
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
              <span className="text-sm text-[#2B2B2B]">{recipe.prep_time} min</span>
            </div>
          </div>

          {/* Ingredients List */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-[#2B2B2B] mb-3">
              Ingrediëntenlijst
            </h2>
            <IngredientsList
              ingredients={recipe.ingredients}
              multiplier={servingMultiplier}
              inventory={inventory}
              basicInventory={basicInventory}
              originalIngredients={isAdapted && originalRecipe ? originalRecipe.ingredients : undefined}
            />
          </div>

          {/* Instructions List */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-[#2B2B2B] mb-3">
              Bereidingswijze
            </h2>
            <div className="space-y-3">
              {recipe.instructions.map((instruction, index) => {
                const isChanged = isAdapted && originalRecipe
                  ? originalRecipe.instructions[index] !== instruction ||
                  index >= originalRecipe.instructions.length
                  : false;

                return (
                  <div
                    key={index}
                    className={`rounded-xl p-4 ${isChanged
                        ? 'bg-[#D6EDE2] border-2 border-[#1F6F54]'
                        : 'bg-white border border-[#E5E5E0]'
                      }`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full font-semibold ${isChanged
                            ? 'bg-[#1F6F54] text-white'
                            : 'bg-[#E5E5E0] text-[#2B2B2B]'
                          }`}
                      >
                        {index + 1}
                      </div>
                      <p
                        className={`flex-1 ${isChanged ? 'text-[#1F6F54] font-medium' : 'text-[#2B2B2B]'
                          }`}
                      >
                        {instruction}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-3 mb-6">
            <button
              onClick={() => setIsAIModalOpen(true)}
              className="w-full rounded-xl bg-[#1F6F54] px-4 py-3 flex items-center justify-center gap-2 text-white font-semibold transition-colors hover:bg-[#1a5d47]"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="text-white"
              >
                <path
                  d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
                  fill="currentColor"
                />
              </svg>
              <span>Laat AI dit recept aanpassen</span>
            </button>

            <button
              onClick={() => {
                router.push(`/recepten/${recipeId}/kookmodus`);
              }}
              className="w-full rounded-xl bg-[#9FC5B5] px-4 py-3 flex items-center justify-center gap-2 text-[#1F6F54] font-semibold transition-colors hover:bg-[#8FB5A5]"
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
                  d="M12 2L2 7L12 12L22 7L12 2Z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M2 17L12 22L22 17"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M2 12L12 17L22 12"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span>Start kookmodus</span>
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="sticky bottom-0 z-10 bg-[#FAFAF7]">
        <BottomNav />
      </div>

      {/* AI Modal */}
      {recipe && (
        <RecipeAIModal
          isOpen={isAIModalOpen}
          onClose={() => {
            setIsAIModalOpen(false);
            setAiInitialPrompt(null);
          }}
          recipe={recipe}
          hasAllIngredients={hasAllIngredients}
          missingIngredients={missingIngredients}
          initialPrompt={aiInitialPrompt}
        />
      )}
    </div>
  );
}
