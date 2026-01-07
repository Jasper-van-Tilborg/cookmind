'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { Clock, Users, ChefHat, Sparkles } from 'lucide-react';
import MatchBadge from '@/src/components/recipes/MatchBadge';
import SubstitutionBadge from '@/src/components/recipes/SubstitutionBadge';
import SubstitutionModal from '@/src/components/recipes/SubstitutionModal';
import SubstitutionSuggestions from '@/src/components/recipes/SubstitutionSuggestions';
import AITweaker from '@/src/components/recipes/AITweaker';
import FavoriteButton from '@/src/components/recipes/FavoriteButton';
import VariantMessage from '@/src/components/recipes/VariantMessage';
import { Recipe, Substitution, InventoryItem, VariantCheckResult } from '@/src/types';
import { isBasicInventoryItem, isVariantOfBasicInventory, BASIC_INVENTORY_ITEMS } from '@/src/lib/basic-inventory';
import { mockRecipes } from '@/src/lib/data';
import { storage } from '@/src/lib/storage';
import { aiSimulator } from '@/src/lib/simulation';
import { updateRecipeSteps } from '@/src/lib/recipe-utils';
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
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [match, setMatch] = useState(0);
  const [missingIngredients, setMissingIngredients] = useState<string[]>([]);
  const [variantChecks, setVariantChecks] = useState<Map<string, VariantCheckResult>>(new Map());
  const [loadingVariants, setLoadingVariants] = useState<Set<string>>(new Set());
  const [acceptedSubstitutions, setAcceptedSubstitutions] = useState<Map<string, Substitution>>(new Map());
  const [selectedIngredientForSubstitution, setSelectedIngredientForSubstitution] = useState<string | null>(null);
  const [isSubstitutionModalOpen, setIsSubstitutionModalOpen] = useState(false);
  const [isAITweakerOpen, setIsAITweakerOpen] = useState(false);
  const [displayRecipe, setDisplayRecipe] = useState<Recipe | null>(null);

  useEffect(() => {
    const foundRecipe = mockRecipes.find(r => r.id === recipeId);
    if (foundRecipe) {
      setRecipe(foundRecipe);
      setDisplayRecipe(foundRecipe);
      setServings(foundRecipe.servings);
    }
  }, [recipeId]);

  useEffect(() => {
    async function loadInventory() {
      if (user) {
        const savedInventory = await storage.getInventory(user.id);
        const inventoryNames = savedInventory.map(item => item.name);
        setInventory(inventoryNames);
        setInventoryItems(savedInventory);

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

          // Check voor varianten van basisvoorraad
          checkVariantsForMissingIngredients(missing, inventoryNames, recipe);
        }
      }
    }
    if (user) {
      loadInventory();
    }
  }, [recipe, user]);

  // Update display recipe when substitutions are accepted
  useEffect(() => {
    if (recipe && acceptedSubstitutions.size > 0) {
      const updatedSteps = updateRecipeSteps(recipe, Array.from(acceptedSubstitutions.values()));
      const updatedIngredients = recipe.ingredients.map(ing => {
        const substitution = acceptedSubstitutions.get(ing.name);
        if (substitution) {
          return {
            ...ing,
            name: substitution.substitute,
          };
        }
        return ing;
      });

      setDisplayRecipe({
        ...recipe,
        ingredients: updatedIngredients,
        steps: updatedSteps,
      });
    } else if (recipe) {
      setDisplayRecipe(recipe);
    }
  }, [recipe, acceptedSubstitutions]);

  if (!recipe || !displayRecipe) {
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

  const handleSubstitutionAccept = (substitution: Substitution) => {
    const newSubstitutions = new Map(acceptedSubstitutions);
    newSubstitutions.set(substitution.original, substitution);
    setAcceptedSubstitutions(newSubstitutions);
  };

  const handleAITweakerAccept = (modifiedRecipe: Recipe) => {
    setDisplayRecipe(modifiedRecipe);
    setRecipe(modifiedRecipe);
    // Reset substitutions when recipe is completely modified
    setAcceptedSubstitutions(new Map());
  };

  const checkVariantsForMissingIngredients = async (
    missing: string[],
    inventoryNames: string[],
    recipe: Recipe
  ) => {
    if (!user || !recipe) return;

    // Haal basisvoorraad items op uit inventory
    const basicInventoryItems = inventoryNames.filter(name =>
      isBasicInventoryItem(name)
    );

    if (basicInventoryItems.length === 0) return;

    // Check elk missing ingredient
    for (const missingIngredient of missing) {
      const variantCheck = isVariantOfBasicInventory(missingIngredient, inventoryNames);
      
      if (variantCheck.isVariant && variantCheck.basicItem) {
        // AI check variant acceptabiliteit
        setLoadingVariants(prev => new Set(prev).add(missingIngredient));
        
        try {
          const response = await fetch('/api/ai/check-variant', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              recipeId: recipe.id,
              recipeIngredient: missingIngredient,
              userBasicInventory: basicInventoryItems,
            }),
          });

          if (response.ok) {
            const result: VariantCheckResult = await response.json();
            setVariantChecks(prev => {
              const newMap = new Map(prev);
              newMap.set(missingIngredient, result);
              return newMap;
            });
          }
        } catch (error) {
          console.error('Error checking variant:', error);
        } finally {
          setLoadingVariants(prev => {
            const newSet = new Set(prev);
            newSet.delete(missingIngredient);
            return newSet;
          });
        }
      }
    }
  };

  const handleAddVariant = async (variant: string) => {
    if (!user) return;
    
    // Navigeer naar product search met variant naam
    router.push(`/inventory?search=${encodeURIComponent(variant)}`);
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
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-2xl font-bold text-gray-800">{displayRecipe.title}</h1>
            <div className="flex items-center gap-2">
              <FavoriteButton recipeId={recipe.id} />
              <button
                onClick={() => setIsAITweakerOpen(true)}
                className="p-2 bg-purple-100 text-purple-600 rounded-lg hover:bg-purple-200 transition-colors touch-target"
                title="AI Tweaker"
              >
                <Sparkles size={20} />
              </button>
            </div>
          </div>
          <p className="text-gray-600">{displayRecipe.description}</p>
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
          
          {/* Variant Messages */}
          {Array.from(variantChecks.entries()).map(([ingredient, variantCheck]) => {
            if (!variantCheck.message) return null;
            return (
              <VariantMessage
                key={ingredient}
                variant={variantCheck}
                onAddVariant={() => handleAddVariant(variantCheck.variant || ingredient)}
              />
            );
          })}

          <div className="space-y-2">
            {displayRecipe.ingredients.map((ingredient, index) => {
              const adjustedAmount = getAdjustedAmount(ingredient.amount);
              const isChecked = checkedIngredients.has(ingredient.name);
              const originalIngredient = recipe.ingredients.find(ing => 
                ing.name === ingredient.name || 
                acceptedSubstitutions.get(ing.name)?.substitute === ingredient.name
              ) || ingredient;
              const isSubstituted = acceptedSubstitutions.has(originalIngredient.name);
              const isInInventory = inventory.some(inv => 
                inv.toLowerCase().includes(ingredient.name.toLowerCase()) || 
                ingredient.name.toLowerCase().includes(inv.toLowerCase())
              );
              const isMissing = missingIngredients.includes(originalIngredient.name);

              return (
                <div key={index}>
                  <label
                    className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-colors ${
                      isChecked
                        ? 'bg-green-50 border-green-200'
                        : isInInventory
                        ? 'bg-white border-gray-200'
                        : 'bg-yellow-50 border-yellow-200'
                    } ${isSubstituted ? 'border-purple-300 bg-purple-50' : ''}`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => handleIngredientToggle(ingredient.name)}
                      className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500"
                    />
                    <span className={`flex-1 ${isChecked ? 'line-through text-gray-500' : 'text-gray-800'}`}>
                      {adjustedAmount} {ingredient.unit} {ingredient.name}
                      {isSubstituted && (
                        <span className="ml-2 text-xs text-purple-600">
                          (vervangen voor {originalIngredient.name})
                        </span>
                      )}
                    </span>
                    {!isInInventory && isMissing && (
                      <SubstitutionBadge
                        onClick={() => {
                          setSelectedIngredientForSubstitution(originalIngredient.name);
                          setIsSubstitutionModalOpen(true);
                        }}
                        loading={false}
                      />
                    )}
                    {!isInInventory && !isMissing && (
                      <span className="text-xs text-yellow-600 font-medium">Ontbreekt</span>
                    )}
                  </label>
                </div>
              );
            })}
          </div>

          {/* Show accepted substitutions */}
          {acceptedSubstitutions.size > 0 && (
            <div className="mt-4">
              {Array.from(acceptedSubstitutions.values()).map((sub, index) => (
                <SubstitutionSuggestions
                  key={index}
                  originalIngredient={sub.original}
                  substitutions={[sub]}
                  loading={false}
                  onAccept={() => {}}
                />
              ))}
            </div>
          )}
        </div>

        {/* Steps */}
        <div>
          <h2 className="text-lg font-semibold text-gray-800 mb-3">Bereidingswijze</h2>
          <div className="space-y-4">
            {displayRecipe.steps.map((step, index) => (
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

      {/* Substitution Modal */}
      {isSubstitutionModalOpen && selectedIngredientForSubstitution && (
        <SubstitutionModal
          isOpen={isSubstitutionModalOpen}
          onClose={() => {
            setIsSubstitutionModalOpen(false);
            setSelectedIngredientForSubstitution(null);
          }}
          recipe={recipe}
          missingIngredient={selectedIngredientForSubstitution}
          onSubstitutionAccepted={handleSubstitutionAccept}
        />
      )}

      {/* AI Tweaker */}
      <AITweaker
        recipe={displayRecipe}
        userInventory={inventory}
        isOpen={isAITweakerOpen}
        onClose={() => setIsAITweakerOpen(false)}
        onAccept={handleAITweakerAccept}
      />
    </div>
  );
}


