'use client';

import { Recipe } from '@/app/recepten/page';
import { InventoryItem } from '@/components/voorraad/ProductCard';

interface IngredientsListProps {
  ingredients: Recipe['ingredients'];
  multiplier: number;
  inventory: InventoryItem[];
  basicInventory: Set<string>;
  originalIngredients?: Recipe['ingredients'];
}

export default function IngredientsList({
  ingredients,
  multiplier,
  inventory,
  basicInventory,
  originalIngredients,
}: IngredientsListProps) {
  const formatAmount = (amount: number, unit: string): string => {
    const adjustedAmount = amount * multiplier;

    // Format decimals nicely
    if (adjustedAmount % 1 === 0) {
      return `${adjustedAmount} ${unit}`;
    }

    // Round to 1 decimal for small amounts
    if (adjustedAmount < 1) {
      return `${adjustedAmount.toFixed(1)} ${unit}`;
    }

    // Round to 1 decimal for larger amounts
    return `${adjustedAmount.toFixed(1)} ${unit}`;
  };

  const hasIngredient = (ingredientTag: string | null): boolean => {
    if (!ingredientTag) return false;

    const inventoryTags = new Set(
      inventory
        .map((item) => item.ingredient_tag)
        .filter((tag): tag is string => tag !== null && tag !== undefined)
    );

    return inventoryTags.has(ingredientTag) || basicInventory.has(ingredientTag);
  };

  // Check if ingredient is modified or new
  const isIngredientChanged = (ingredient: Recipe['ingredients'][0], index: number): boolean => {
    if (!originalIngredients) return false;

    // Check if it's a new ingredient (not in original)
    const originalIngredientNames = new Set(
      originalIngredients.map((ing) => ing.name.toLowerCase())
    );
    if (!originalIngredientNames.has(ingredient.name.toLowerCase())) {
      return true; // New ingredient
    }

    // Check if amount or unit changed
    const originalIng = originalIngredients.find(
      (orig) => orig.name.toLowerCase() === ingredient.name.toLowerCase()
    );
    if (originalIng) {
      return (
        originalIng.amount !== ingredient.amount ||
        originalIng.unit !== ingredient.unit
      );
    }

    return false;
  };

  // Split ingredients into two columns
  const leftColumn = ingredients.filter((_, index) => index % 2 === 0);
  const rightColumn = ingredients.filter((_, index) => index % 2 === 1);

  return (
    <div className="grid grid-cols-2 gap-3">
      {/* Left Column */}
      <div className="space-y-2">
        {leftColumn.map((ingredient, index) => {
          const originalIndex = index * 2;
          const hasInStock = hasIngredient(ingredient.ingredient_tag);
          const isChanged = isIngredientChanged(ingredient, originalIndex);

          return (
            <div
              key={originalIndex}
              className={`rounded-xl p-3 ${isChanged
                  ? 'bg-[#D6EDE2] border-2 border-[#1F6F54]'
                  : 'bg-white border border-[#E5E5E0]'
                }`}
            >
              <div className="flex items-start justify-between gap-2">
                <span className={`text-sm flex-1 ${isChanged ? 'text-[#1F6F54] font-medium' : 'text-[#2B2B2B]'}`}>
                  {formatAmount(ingredient.amount, ingredient.unit)} {ingredient.name}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Right Column */}
      <div className="space-y-2">
        {rightColumn.map((ingredient, index) => {
          const originalIndex = index * 2 + 1;
          const hasInStock = hasIngredient(ingredient.ingredient_tag);
          const isChanged = isIngredientChanged(ingredient, originalIndex);

          return (
            <div
              key={originalIndex}
              className={`rounded-xl p-3 ${isChanged
                  ? 'bg-[#D6EDE2] border-2 border-[#1F6F54]'
                  : 'bg-white border border-[#E5E5E0]'
                }`}
            >
              <div className="flex items-start justify-between gap-2">
                <span className={`text-sm flex-1 ${isChanged ? 'text-[#1F6F54] font-medium' : 'text-[#2B2B2B]'}`}>
                  {formatAmount(ingredient.amount, ingredient.unit)} {ingredient.name}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
