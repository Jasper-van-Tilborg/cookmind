import { NutritionFacts } from './barcode';

/**
 * Bereken voedingswaarden voor een specifieke hoeveelheid
 * @param nutrition Voedingswaarden per 100g
 * @param quantity Geselecteerde hoeveelheid
 * @param baseQuantity Basis hoeveelheid (standaard 100g)
 * @returns Nieuwe NutritionFacts object met aangepaste waarden
 */
export function calculateNutritionForQuantity(
  nutrition: NutritionFacts,
  quantity: number,
  baseQuantity: number = 100
): NutritionFacts {
  const ratio = quantity / baseQuantity;

  const calculate = (value: number | undefined): number | undefined => {
    if (value === undefined) return undefined;
    return Math.round((value * ratio) * 10) / 10;
  };

  const calculateInt = (value: number | undefined): number | undefined => {
    if (value === undefined) return undefined;
    return Math.round(value * ratio);
  };

  return {
    calories: calculateInt(nutrition.calories) ?? 0,
    carbs: calculate(nutrition.carbs) ?? 0,
    protein: calculate(nutrition.protein) ?? 0,
    fat: calculate(nutrition.fat) ?? 0,
    fiber: calculate(nutrition.fiber),
    sugar: calculate(nutrition.sugar),
    sodium: calculateInt(nutrition.sodium),
    calcium: calculateInt(nutrition.calcium),
    iron: calculateInt(nutrition.iron),
    vitaminC: calculateInt(nutrition.vitaminC),
    magnesium: calculateInt(nutrition.magnesium),
    potassium: calculateInt(nutrition.potassium),
    zinc: calculateInt(nutrition.zinc),
    phosphorus: calculateInt(nutrition.phosphorus),
    copper: calculateInt(nutrition.copper),
    selenium: calculateInt(nutrition.selenium),
  };
}

