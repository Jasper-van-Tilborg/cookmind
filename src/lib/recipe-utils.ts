import { Recipe, Substitution } from '@/src/types';

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


