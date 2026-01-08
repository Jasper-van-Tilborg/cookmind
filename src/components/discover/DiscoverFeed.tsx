'use client';

import { useState, useEffect, useMemo } from 'react';
import DiscoverRecipeCard from './DiscoverRecipeCard';
import { UserRecipe } from '@/src/types';
import { storage } from '@/src/lib/storage';
import { aiSimulator } from '@/src/lib/simulation';
import { useAuth } from '@/src/contexts/AuthContext';
import { mockUserRecipes } from '@/src/lib/data';

interface DiscoverFeedProps {
  limit?: number;
}

export default function DiscoverFeed({ limit = 50 }: DiscoverFeedProps) {
  const { user } = useAuth();
  const [recipes, setRecipes] = useState<UserRecipe[]>([]);
  const [inventory, setInventory] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        // Load user recipes (for now use mock data, later from storage)
        const userRecipes = await storage.getUserRecipes(undefined, limit);
        
        // If no recipes in storage, use mock data
        if (userRecipes.length === 0) {
          setRecipes(mockUserRecipes);
        } else {
          setRecipes(userRecipes);
        }

        // Load inventory for match calculation
        if (user) {
          const savedInventory = await storage.getInventory(user.id);
          const inventoryNames = savedInventory.map(item => item.name);
          setInventory(inventoryNames);
        }
      } catch (error) {
        console.error('Error loading discover feed:', error);
        // Fallback to mock data
        setRecipes(mockUserRecipes);
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, [user, limit]);

  // Calculate matches for all recipes
  const recipesWithMatches = useMemo(() => {
    return recipes.map(recipe => {
      const recipeIngredients = recipe.ingredients.map(ing => ing.name);
      const match = inventory.length > 0
        ? aiSimulator.calculateMatch(recipeIngredients, inventory)
        : 0;

      return {
        recipe,
        match,
      };
    });
  }, [recipes, inventory]);

  // Sort by created date (newest first)
  const sortedRecipes = useMemo(() => {
    return [...recipesWithMatches].sort((a, b) => {
      const dateA = a.recipe.createdAt.getTime();
      const dateB = b.recipe.createdAt.getTime();
      return dateB - dateA;
    });
  }, [recipesWithMatches]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-gray-200 rounded-xl aspect-[4/3] animate-pulse" />
        ))}
      </div>
    );
  }

  if (sortedRecipes.length === 0) {
    return (
      <div className="bg-white rounded-lg p-8 text-center shadow-sm">
        <p className="text-gray-600 mb-2">Nog geen recepten beschikbaar</p>
        <p className="text-sm text-gray-500">
          Wees de eerste om een recept te delen!
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4">
      {sortedRecipes.map(({ recipe, match }) => (
        <DiscoverRecipeCard
          key={recipe.id}
          recipe={recipe}
          match={match}
        />
      ))}
    </div>
  );
}


