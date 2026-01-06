export interface InventoryItem {
  id: number;
  name: string;
  category: string;
  quantity: number;
  unit?: string;
  expiry?: Date;
}

export interface RecipeIngredient {
  name: string;
  amount: number;
  unit: string;
}

export interface Recipe {
  id: number;
  title: string;
  description: string;
  prepTime: number; // in minuten
  servings: number;
  difficulty: 'Makkelijk' | 'Gemiddeld' | 'Moeilijk';
  ingredients: RecipeIngredient[];
  steps: string[];
  imageUrl?: string;
  tags?: string[]; // voor filters zoals 'vegetarisch', 'snel'
}

export type FilterType = 'all' | 'quick' | 'vegetarian';



