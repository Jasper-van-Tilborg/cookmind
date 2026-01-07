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
  stepIngredients?: { stepIndex: number; ingredients: RecipeIngredient[] }[];
}

export type FilterType = 'all' | 'quick' | 'vegetarian' | 'favorites';

export interface AdvancedFilters {
  timeRange?: { min: number; max: number };
  difficulty?: ('Makkelijk' | 'Gemiddeld' | 'Moeilijk')[];
  cuisine?: string[];
  diet?: ('vegetarisch' | 'vegan' | 'glutenvrij' | 'lactosevrij')[];
  missingOne?: boolean;
}

export interface Substitution {
  original: string;
  substitute: string;
  reason: string;
  adjustments?: string; // Optionele aanpassingen aan kooktijd/temperatuur
}

export interface RecipeWithSubstitutions extends Recipe {
  substitutions?: Substitution[];
}

export interface AITweakerRequest {
  recipe: Recipe;
  prompt: string;
  userInventory: string[];
}

export interface BasicInventoryItem {
  name: string;
  category: string;
  quantity: number;
  unit?: string;
}

export interface VariantCheckResult {
  acceptable: boolean;
  message: string;
  needsVariant: boolean;
  basicItem?: string;
  variant?: string;
}

export interface UserRecipe extends Recipe {
  userId: string;
  username: string;
  videoUrl?: string;
  thumbnailUrl?: string;
  createdAt: Date;
  likes?: number;
  isVideo: boolean;
}



