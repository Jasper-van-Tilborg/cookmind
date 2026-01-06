'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { Clock, Users, ChefHat } from 'lucide-react';
import MatchBadge from '@/src/components/recipes/MatchBadge';
import { Recipe } from '@/src/types';
import { mockRecipes } from '@/src/lib/data';
import { storage } from '@/src/lib/storage';
import { aiSimulator } from '@/src/lib/simulation';
import { useAuth } from '@/src/contexts/AuthContext';

export default function RecipeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const recipeId = Number(params.id);
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [servings, setServings] = useState(4);
  const [checkedIngredients, setCheckedIngredients] = useState<Set<string>>(new Set());
  const [inventory, setInventory] = useState<string[]>([]);
  const [match, setMatch] = useState(0);
  const [missingIngredients, setMissingIngredients] = useState<string[]>([]);

  useEffect(() => {
    const foundRecipe = mockRecipes.find(r => r.id === recipeId);
    if (foundRecipe) {
      setRecipe(foundRecipe);
      setServings(foundRecipe.servings);
    }
  }, [recipeId]);

  useEffect(() => {
    async function loadInventory() {
      if (user) {
        const savedInventory = await storage.getInventory(user.id);
        const inventoryNames = savedInventory.map(item => item.name);
        setInventory(inventoryNames);

        if (recipe) {
          const recipeIngredients = recipe.ingredients.map(ing => ing.name);
          const calculatedMatch = aiSimulator.calculateMatch(recipeIngredients, inventoryNames);
          setMatch(calculatedMatch);

          const missing = recipeIngredients.filter(
            ing => !inventoryNames.some(inv => 
              inv.toLowerCase().includes(ing.toLowerCase()) || 
              ing.toLowerCase().includes(inv.toLowerCase())
            )
          );
          setMissingIngredients(missing);
        }
      }
    }
    if (user) {
      loadInventory();
    }
  }, [recipe, user]);

  if (!recipe) {
    return (
      <div className="p-4">
        <p>Recept niet gevonden</p>
      </div>
    );
  }

  const handleIngredientToggle = (ingredientName: string) => {
    const newChecked = new Set(checkedIngredients);
    if (newChecked.has(ingredientName)) {
      newChecked.delete(ingredientName);
    } else {
      newChecked.add(ingredientName);
    }
    setCheckedIngredients(newChecked);
  };

  const getAdjustedAmount = (originalAmount: number) => {
    return Math.round((originalAmount / recipe.servings) * servings);
  };

  const handleStartCooking = () => {
    router.push(`/recipes/${recipe.id}/cook`);
  };

  return (
    <div className="pb-6 max-w-md mx-auto">
      {/* Recipe Image */}
      <div className="relative w-full h-64 bg-gray-200">
        {recipe.imageUrl ? (
          <Image
            src={recipe.imageUrl}
            alt={recipe.title}
            fill
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            Geen afbeelding
          </div>
        )}
        <div className="absolute top-4 right-4">
          <MatchBadge percentage={match} size="md" />
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Title & Description */}
        <div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">{recipe.title}</h1>
          <p className="text-gray-600">{recipe.description}</p>
        </div>

        {/* Meta Info */}
        <div className="flex items-center gap-4 text-sm text-gray-600">
          <div className="flex items-center gap-1">
            <Clock size={18} />
            <span>{recipe.prepTime} min</span>
          </div>
          <div className="flex items-center gap-1">
            <Users size={18} />
            <span>{recipe.servings} personen</span>
          </div>
          <div className="flex items-center gap-1">
            <ChefHat size={18} />
            <span>{recipe.difficulty}</span>
          </div>
        </div>

        {/* Servings Slider */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Aantal personen: {servings}
          </label>
          <input
            type="range"
            min="1"
            max="8"
            value={servings}
            onChange={(e) => setServings(Number(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>1</span>
            <span>8</span>
          </div>
        </div>

        {/* Ingredients */}
        <div>
          <h2 className="text-lg font-semibold text-gray-800 mb-3">Ingrediënten</h2>
          <div className="space-y-2">
            {recipe.ingredients.map((ingredient, index) => {
              const adjustedAmount = getAdjustedAmount(ingredient.amount);
              const isChecked = checkedIngredients.has(ingredient.name);
              const isInInventory = inventory.some(inv => 
                inv.toLowerCase().includes(ingredient.name.toLowerCase()) || 
                ingredient.name.toLowerCase().includes(inv.toLowerCase())
              );

              return (
                <label
                  key={index}
                  className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-colors ${
                    isChecked
                      ? 'bg-green-50 border-green-200'
                      : isInInventory
                      ? 'bg-white border-gray-200'
                      : 'bg-yellow-50 border-yellow-200'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => handleIngredientToggle(ingredient.name)}
                    className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500"
                  />
                  <span className={`flex-1 ${isChecked ? 'line-through text-gray-500' : 'text-gray-800'}`}>
                    {adjustedAmount} {ingredient.unit} {ingredient.name}
                  </span>
                  {!isInInventory && (
                    <span className="text-xs text-yellow-600 font-medium">Ontbreekt</span>
                  )}
                </label>
              );
            })}
          </div>

          {/* Missing Ingredients Substitution */}
          {missingIngredients.length > 0 && (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h3 className="text-sm font-semibold text-blue-800 mb-2">
                AI Substitutie suggesties
              </h3>
              {missingIngredients.slice(0, 2).map((ingredient, index) => {
                const substitutions = aiSimulator.suggestSubstitutions(ingredient);
                return (
                  <div key={index} className="mb-2 last:mb-0">
                    <p className="text-xs text-blue-700 mb-1">
                      <strong>{ingredient}:</strong> {substitutions.join(', ')}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Steps */}
        <div>
          <h2 className="text-lg font-semibold text-gray-800 mb-3">Bereidingswijze</h2>
          <div className="space-y-4">
            {recipe.steps.map((step, index) => (
              <div key={index} className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-semibold text-sm">
                  {index + 1}
                </div>
                <p className="flex-1 text-gray-700 pt-1">{step}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Start Cooking Button */}
        <button
          onClick={handleStartCooking}
          className="w-full bg-purple-600 text-white font-semibold py-4 px-6 rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
        >
          <ChefHat size={20} />
          START MET KOKEN
        </button>
      </div>
    </div>
  );
}


