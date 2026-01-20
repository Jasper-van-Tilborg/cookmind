'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Recipe } from '@/app/recepten/page';
import AIAdaptationSummary from '@/components/recepten/AIAdaptationSummary';

export default function AIAdaptationSummaryPage() {
  const router = useRouter();
  const params = useParams();
  const supabase = createClient();
  const recipeId = params.id as string;

  const [originalRecipe, setOriginalRecipe] = useState<Recipe | null>(null);
  const [adaptedRecipe, setAdaptedRecipe] = useState<Recipe | null>(null);
  const [aiPrompt, setAiPrompt] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

        // Load original recipe and adapted recipe
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

        const originalData: Recipe = {
          ...recipeResult.data,
          instructions: recipeResult.data.instructions as string[],
          ingredients: recipeResult.data.ingredients as Recipe['ingredients'],
        };
        setOriginalRecipe(originalData);

        if (adaptedRecipeResult.data && !adaptedRecipeResult.error) {
          const adaptedData: Recipe = {
            ...adaptedRecipeResult.data,
            id: recipeId,
            instructions: adaptedRecipeResult.data.instructions as string[],
            ingredients: adaptedRecipeResult.data.ingredients as Recipe['ingredients'],
            prep_time: recipeResult.data.prep_time,
            servings: recipeResult.data.servings,
            difficulty: recipeResult.data.difficulty,
            image_url: recipeResult.data.image_url,
          };
          setAdaptedRecipe(adaptedData);
          setAiPrompt(adaptedRecipeResult.data.ai_prompt || '');
        } else {
          throw new Error('Geen aangepast recept gevonden');
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Fout bij laden gegevens';
        setError(errorMessage);
        console.error('Error loading adaptation summary:', err);
      } finally {
        setIsLoading(false);
      }
    };

    if (recipeId) {
      loadData();
    }
  }, [recipeId, router, supabase]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FAFAF7]">
        <p className="text-[#2B2B2B]">Laden...</p>
      </div>
    );
  }

  if (error || !originalRecipe || !adaptedRecipe) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#FAFAF7] px-6">
        <p className="text-center text-[#2B2B2B]">{error || 'Gegevens niet gevonden'}</p>
        <button
          onClick={() => router.push(`/recepten/${recipeId}`)}
          className="mt-4 rounded-xl bg-[#1F6F54] px-6 py-3 text-white font-semibold"
        >
          Terug naar recept
        </button>
      </div>
    );
  }

  return (
    <AIAdaptationSummary
      originalRecipe={originalRecipe}
      adaptedRecipe={adaptedRecipe}
      aiPrompt={aiPrompt}
      recipeId={recipeId}
    />
  );
}
