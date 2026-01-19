'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import BottomNav from '@/components/navigation/BottomNav';
import RecipesHeader from '@/components/recepten/RecipesHeader';
import RecipeCard from '@/components/recepten/RecipeCard';
import { InventoryItem } from '@/components/voorraad/ProductCard';

export interface Recipe {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  prep_time: number;
  servings: number | null;
  difficulty: 'easy' | 'medium' | 'hard' | null;
  instructions: string[];
  ingredients: Array<{
    name: string;
    amount: number;
    unit: string;
    ingredient_tag: string | null;
  }>;
}

export interface RecipeWithMatch extends Recipe {
  matchPercentage: number;
  missingIngredients: string[];
}

export default function ReceptenPage() {
  const router = useRouter();
  const supabase = createClient();
  const [recipes, setRecipes] = useState<RecipeWithMatch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [basicInventory, setBasicInventory] = useState<Set<string>>(new Set());
  const [adaptedRecipeIds, setAdaptedRecipeIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const loadData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          router.push('/onboarding');
          return;
        }

        // Load recipes, inventory, basic inventory and adapted recipes in parallel
        const [recipesResult, inventoryResult, basicInventoryResult, adaptedRecipesResult] = await Promise.all([
          supabase
            .from('recipes')
            .select('*')
            .order('created_at', { ascending: false }),
          supabase
            .from('inventory')
            .select('*')
            .eq('user_id', user.id),
          supabase
            .from('basic_inventory')
            .select('product_id')
            .eq('user_id', user.id),
          supabase
            .from('user_recipe_adaptations')
            .select('original_recipe_id')
            .eq('user_id', user.id),
        ]);

        // Handle recipes
        if (recipesResult.error) {
          console.error('Error loading recipes:', recipesResult.error);
          setRecipes([]);
        } else {
          const recipesData = (recipesResult.data || []).map((recipe) => ({
            ...recipe,
            instructions: recipe.instructions as string[],
            ingredients: recipe.ingredients as Recipe['ingredients'],
          }));

          // Handle inventory
          const inventoryData = inventoryResult.data || [];
          setInventory(inventoryData);

          // Handle basic inventory
          const basicInventorySet = new Set(
            (basicInventoryResult.data || []).map((item) => item.product_id)
          );
          setBasicInventory(basicInventorySet);

          // Handle adapted recipes
          const adaptedIds = new Set(
            (adaptedRecipesResult.data || []).map((item) => item.original_recipe_id)
          );
          setAdaptedRecipeIds(adaptedIds);

          // Calculate match percentages
          const recipesWithMatch = recipesData.map((recipe) => {
            const { matchPercentage, missingIngredients } = calculateMatch(
              recipe,
              inventoryData,
              basicInventorySet
            );
            return {
              ...recipe,
              matchPercentage,
              missingIngredients,
            };
          });

          // Sort by match percentage (highest first)
          recipesWithMatch.sort((a, b) => b.matchPercentage - a.matchPercentage);

          setRecipes(recipesWithMatch);
        }
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [router, supabase]);

  const calculateMatch = (
    recipe: Recipe,
    inventory: InventoryItem[],
    basicInventory: Set<string>
  ): { matchPercentage: number; missingIngredients: string[] } => {
    if (recipe.ingredients.length === 0) {
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
        // Ingredient without tag, skip for matching
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

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#FAFAF7]">
        <p className="text-[#2B2B2B]">Laden...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#FAFAF7]">
      {/* Header - Sticky */}
      <div className="sticky top-0 z-10 bg-[#FAFAF7]">
        <RecipesHeader />
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto pb-20">
        {recipes.length === 0 ? (
          <div className="px-6 py-8 text-center">
            <p className="text-[#2B2B2B]/60">Geen recepten gevonden</p>
          </div>
        ) : (
          <div className="px-6 py-4">
            {recipes.map((recipe) => (
              <RecipeCard
                key={recipe.id}
                recipe={recipe}
                isAdapted={adaptedRecipeIds.has(recipe.id)}
                onAIClick={() => {
                  // TODO: Implement AI functionality
                  console.log('AI click for recipe:', recipe.id);
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Bottom Navigation - Sticky */}
      <div className="sticky bottom-0 z-10 bg-[#FAFAF7]">
        <BottomNav />
      </div>
    </div>
  );
}
