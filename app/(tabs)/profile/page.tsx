'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/src/contexts/AuthContext';
import { Heart } from 'lucide-react';
import RecipeCard from '@/src/components/recipes/RecipeCard';
import { storage } from '@/src/lib/storage';
import { mockRecipes } from '@/src/lib/data';
import { Recipe } from '@/src/types';
import { aiSimulator } from '@/src/lib/simulation';

export default function ProfilePage() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const [favoriteRecipes, setFavoriteRecipes] = useState<Recipe[]>([]);
  const [inventory, setInventory] = useState<string[]>([]);

  useEffect(() => {
    async function loadFavorites() {
      if (user) {
        const favoriteIds = await storage.getFavorites(user.id);
        const favorites = mockRecipes.filter(recipe => favoriteIds.includes(recipe.id));
        setFavoriteRecipes(favorites);

        // Load inventory for match calculation
        const savedInventory = await storage.getInventory(user.id);
        const inventoryNames = savedInventory.map(item => item.name);
        setInventory(inventoryNames);
      }
    }
    loadFavorites();
  }, [user]);

  const handleLogout = async () => {
    await signOut();
    // Redirect naar login (niet onboarding, want die is al gezien)
    router.push('/auth/login');
  };

  return (
    <div className="p-4 pb-20 max-w-md mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-4">Profiel</h1>
      
      {user && (
        <div className="bg-white rounded-lg p-6 shadow-sm mb-4">
          <p className="text-gray-600 mb-2">
            <strong>Email:</strong> {user.email}
          </p>
          <p className="text-sm text-gray-500">
            {user.email_confirmed_at ? 'Email geverifieerd' : 'Email niet geverifieerd'}
          </p>
        </div>
      )}

      {/* Favorites Section */}
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-3">
          <Heart size={20} className="text-red-600" fill="currentColor" />
          <h2 className="text-xl font-bold text-gray-800">Mijn Favorieten</h2>
        </div>
        {favoriteRecipes.length === 0 ? (
          <div className="bg-white rounded-lg p-8 text-center shadow-sm">
            <Heart size={48} className="text-gray-300 mx-auto mb-3" />
            <p className="text-gray-600">Je hebt nog geen favoriete recepten</p>
            <p className="text-sm text-gray-500 mt-1">
              Voeg recepten toe aan je favorieten om ze hier te zien
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {favoriteRecipes.map(recipe => {
              const recipeIngredients = recipe.ingredients.map(ing => ing.name);
              const match = aiSimulator.calculateMatch(recipeIngredients, inventory);
              const missingIngredients = recipeIngredients.filter(
                ing => !inventory.some(inv => 
                  inv.toLowerCase().includes(ing.toLowerCase()) || 
                  ing.toLowerCase().includes(inv.toLowerCase())
                )
              );

              return (
                <RecipeCard
                  key={recipe.id}
                  recipe={recipe}
                  match={match}
                  missingIngredients={missingIngredients}
                  onClick={() => router.push(`/recipes/${recipe.id}`)}
                />
              );
            })}
          </div>
        )}
      </div>

      <button
        onClick={handleLogout}
        className="w-full bg-red-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-red-700 transition-colors touch-target"
      >
        Uitloggen
      </button>
    </div>
  );
}
