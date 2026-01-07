'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import RecipeCard from '@/src/components/recipes/RecipeCard';
import RecipeFilters from '@/src/components/recipes/RecipeFilters';
import RecipeFilterModal from '@/src/components/recipes/RecipeFilterModal';
import { Recipe, FilterType, AdvancedFilters } from '@/src/types';
import { mockRecipes } from '@/src/lib/data';
import { storage } from '@/src/lib/storage';
import { aiSimulator } from '@/src/lib/simulation';
import { useAuth } from '@/src/contexts/AuthContext';

export default function RecipesPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [recipes] = useState<Recipe[]>(mockRecipes);
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [advancedFilters, setAdvancedFilters] = useState<AdvancedFilters>({});
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [inventory, setInventory] = useState<string[]>([]);
  const [favoriteRecipeIds, setFavoriteRecipeIds] = useState<number[]>([]);

  useEffect(() => {
    async function loadInventory() {
      if (user) {
        const savedInventory = await storage.getInventory(user.id);
        const inventoryNames = savedInventory.map(item => item.name);
        setInventory(inventoryNames);
        
        // Load favorites
        const favorites = await storage.getFavorites(user.id);
        setFavoriteRecipeIds(favorites);
      }
    }
    loadInventory();
  }, [user]);

  // Calculate matches for all recipes
  const recipesWithMatches = useMemo(() => {
    return recipes.map(recipe => {
      const recipeIngredients = recipe.ingredients.map(ing => ing.name);
      const match = aiSimulator.calculateMatch(recipeIngredients, inventory);
      
      const missingIngredients = recipeIngredients.filter(
        ing => !inventory.some(inv => 
          inv.toLowerCase().includes(ing.toLowerCase()) || 
          ing.toLowerCase().includes(inv.toLowerCase())
        )
      );

      return {
        recipe,
        match,
        missingIngredients,
      };
    });
  }, [recipes, inventory]);

  // Filter recipes
  const filteredRecipes = useMemo(() => {
    let filtered = recipesWithMatches;

    // Basic filters
    if (activeFilter === 'quick') {
      filtered = filtered.filter(item => item.recipe.prepTime < 30);
    } else if (activeFilter === 'vegetarian') {
      filtered = filtered.filter(item => item.recipe.tags?.includes('vegetarisch'));
    } else if (activeFilter === 'favorites') {
      filtered = filtered.filter(item => favoriteRecipeIds.includes(item.recipe.id));
    }

    // Advanced filters
    if (advancedFilters.timeRange) {
      const { min, max } = advancedFilters.timeRange;
      filtered = filtered.filter(item => 
        item.recipe.prepTime >= min && item.recipe.prepTime <= max
      );
    }

    if (advancedFilters.difficulty && advancedFilters.difficulty.length > 0) {
      filtered = filtered.filter(item => 
        advancedFilters.difficulty!.includes(item.recipe.difficulty)
      );
    }

    if (advancedFilters.cuisine && advancedFilters.cuisine.length > 0) {
      filtered = filtered.filter(item => {
        const recipeTags = item.recipe.tags || [];
        return advancedFilters.cuisine!.some(cuisine => 
          recipeTags.some(tag => tag.toLowerCase().includes(cuisine.toLowerCase()))
        );
      });
    }

    if (advancedFilters.diet && advancedFilters.diet.length > 0) {
      filtered = filtered.filter(item => {
        const recipeTags = item.recipe.tags || [];
        return advancedFilters.diet!.some(diet => 
          recipeTags.includes(diet)
        );
      });
    }

    if (advancedFilters.missingOne) {
      filtered = filtered.filter(item => item.missingIngredients.length === 1);
    }

    // Sort by match percentage (highest first)
    return filtered.sort((a, b) => b.match - a.match);
  }, [recipesWithMatches, activeFilter, advancedFilters, favoriteRecipeIds]);

  if (inventory.length === 0) {
    return (
      <div className="p-4 pb-20 max-w-md mx-auto">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Recepten</h1>
        <div className="bg-white rounded-lg p-8 text-center shadow-sm">
          <p className="text-gray-600 mb-2">Voeg eerst ingrediënten toe aan je voorraad</p>
          <button
            onClick={() => router.push('/inventory')}
            className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Naar voorraad
          </button>
        </div>
      </div>
    );
  }

  const advancedFilterCount = 
    (advancedFilters.timeRange ? 1 : 0) +
    (advancedFilters.difficulty?.length || 0) +
    (advancedFilters.cuisine?.length || 0) +
    (advancedFilters.diet?.length || 0) +
    (advancedFilters.missingOne ? 1 : 0);

  return (
    <div className="p-4 pb-6 max-w-md mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-4">Recepten</h1>
      
      <div className="mb-4">
        <RecipeFilters 
          activeFilter={activeFilter} 
          onFilterChange={setActiveFilter}
          onOpenAdvancedFilters={() => setIsFilterModalOpen(true)}
          advancedFilterCount={advancedFilterCount}
        />
      </div>

      <RecipeFilterModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        filters={advancedFilters}
        onApplyFilters={setAdvancedFilters}
        onClearFilters={() => setAdvancedFilters({})}
      />

      {filteredRecipes.length === 0 ? (
        <div className="bg-white rounded-lg p-8 text-center shadow-sm">
          <p className="text-gray-600">Geen recepten gevonden met dit filter</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredRecipes.map(({ recipe, match, missingIngredients }) => (
            <RecipeCard
              key={recipe.id}
              recipe={recipe}
              match={match}
              missingIngredients={missingIngredients}
              onClick={() => router.push(`/recipes/${recipe.id}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
