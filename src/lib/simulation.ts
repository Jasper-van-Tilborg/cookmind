import { Recipe } from '@/src/types';

export const aiSimulator = {
  // Berekent match percentage op basis van voorraad
  calculateMatch: (recipeIngredients: string[], userInventory: string[]): number => {
    const matches = recipeIngredients.filter(ing => 
      userInventory.some(inv => 
        inv.toLowerCase().includes(ing.toLowerCase()) || 
        ing.toLowerCase().includes(inv.toLowerCase())
      )
    );
    return Math.round((matches.length / recipeIngredients.length) * 100);
  },

  // Suggereert substituties voor ontbrekende ingrediënten
  suggestSubstitutions: (missingIngredient: string): string[] => {
    const substitutionMap: Record<string, string[]> = {
      'kipfilet': ['varkenshaas', 'tofu', 'kalkoenfilet'],
      'room': ['kokosmelk', 'Griekse yoghurt', 'zure room'],
      'tomatenpuree': ['verse tomaten (meer)', 'paprikapuree'],
      'pasta': ['rijst', 'quinoa', 'aardappelen'],
      'kokosmelk': ['room', 'zure room', 'Griekse yoghurt'],
      'spek': ['ham', 'chorizo', 'pancetta'],
      'risottorijst': ['gewone rijst', 'pasta', 'quinoa'],
      'witte wijn': ['citroensap', 'appelciderazijn'],
      'parmezaanse kaas': ['pecorino', 'cheddar', 'mozzarella'],
    };
    return substitutionMap[missingIngredient.toLowerCase()] || ['Geen suggestie beschikbaar'];
  },

  // Genereert AI uitleg voor substitutie
  generateExplanation: (original: string, substitute: string): string => {
    return `Gebruik ${substitute} in plaats van ${original}. De smaak zal voor 85% overeenkomen. Pas de kooktijd aan: bak 2 minuten korter.`;
  }
};




