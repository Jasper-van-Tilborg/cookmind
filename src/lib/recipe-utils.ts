import { Recipe, Substitution, RecipeIngredient } from '@/src/types';

/**
 * Update receptstappen met substituties (client-side utility)
 */
export function updateRecipeSteps(
  recipe: Recipe,
  substitutions: Substitution[]
): string[] {
  if (!substitutions || substitutions.length === 0) {
    return recipe.steps;
  }

  let updatedSteps = [...recipe.steps];
  
  substitutions.forEach(sub => {
    updatedSteps = updatedSteps.map(step => {
      // Vervang origineel ingrediënt met substitutie in de stap
      const regex = new RegExp(sub.original, 'gi');
      let updatedStep = step.replace(regex, sub.substitute);
      
      // Voeg eventuele aanpassingen toe
      if (sub.adjustments) {
        updatedStep += ` (${sub.adjustments})`;
      }
      
      return updatedStep;
    });
  });

  return updatedSteps;
}

/**
 * Bepaal welke ingrediënten nodig zijn voor een specifieke stap
 */
export function getIngredientsForStep(
  recipe: Recipe,
  stepIndex: number,
  servings: number = recipe.servings
): RecipeIngredient[] {
  // Als er een expliciete mapping is, gebruik die
  if (recipe.stepIngredients && recipe.stepIngredients.length > 0) {
    const stepMapping = recipe.stepIngredients.find(
      mapping => mapping.stepIndex === stepIndex
    );
    if (stepMapping) {
      // Pas hoeveelheden aan op basis van servings
      const servingMultiplier = servings / recipe.servings;
      return stepMapping.ingredients.map(ing => ({
        ...ing,
        amount: ing.amount * servingMultiplier,
      }));
    }
  }

  // Fallback: probeer ingrediënten uit step tekst te halen
  const stepText = recipe.steps[stepIndex]?.toLowerCase() || '';
  const matchedIngredients: RecipeIngredient[] = [];

  recipe.ingredients.forEach(ingredient => {
    const ingredientName = ingredient.name.toLowerCase();
    // Check of ingrediënt naam voorkomt in step tekst
    if (stepText.includes(ingredientName)) {
      // Pas hoeveelheden aan op basis van servings
      const servingMultiplier = servings / recipe.servings;
      matchedIngredients.push({
        ...ingredient,
        amount: ingredient.amount * servingMultiplier,
      });
    }
  });

  // Als we ingrediënten gevonden hebben, return die
  if (matchedIngredients.length > 0) {
    return matchedIngredients;
  }

  // Laatste fallback: return alle ingrediënten (voor eerste stap)
  if (stepIndex === 0) {
    const servingMultiplier = servings / recipe.servings;
    return recipe.ingredients.map(ing => ({
      ...ing,
      amount: ing.amount * servingMultiplier,
    }));
  }

  return [];
}

/**
 * Haal tijd uit step tekst (bijv. "5 minuten", "20 min")
 */
export function getTimeFromStep(stepText: string): number | undefined {
  // Zoek naar patronen zoals "5 minuten", "20 min", "10-15 minuten", etc.
  const timePatterns = [
    /(\d+)\s*minuten?/i,
    /(\d+)\s*min/i,
    /(\d+)\s*-\s*(\d+)\s*minuten?/i, // Voor ranges, neem het maximum
  ];

  for (const pattern of timePatterns) {
    const match = stepText.match(pattern);
    if (match) {
      // Als het een range is (bijv. "10-15 minuten")
      if (match[2]) {
        return parseInt(match[2], 10);
      }
      return parseInt(match[1], 10);
    }
  }

  return undefined;
}



