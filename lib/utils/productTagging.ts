import { ALL_INGREDIENTS, BRAND_NAMES, CATEGORY_MAPPINGS } from '@/lib/constants/ingredients';

/**
 * Normalize a string for matching (lowercase, remove accents, trim)
 */
function normalizeString(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .trim();
}

/**
 * Remove brand names from product name
 */
function removeBrandNames(productName: string): string {
  let cleaned = normalizeString(productName);
  
  for (const brand of BRAND_NAMES) {
    const regex = new RegExp(`\\b${brand}\\b`, 'gi');
    cleaned = cleaned.replace(regex, '');
  }
  
  return cleaned.trim();
}

/**
 * Extract potential ingredient from product name
 */
function extractIngredientFromName(productName: string): string[] {
  const cleaned = removeBrandNames(productName);
  const words = cleaned.split(/\s+/).filter(w => w.length > 2);
  
  // Try to find ingredient in last 2-3 words (usually the actual product)
  const candidates: string[] = [];
  
  // Single word
  if (words.length === 1) {
    candidates.push(words[0]);
  }
  
  // Last word
  if (words.length > 1) {
    candidates.push(words[words.length - 1]);
  }
  
  // Last two words (e.g., "rode paprika")
  if (words.length > 2) {
    candidates.push(`${words[words.length - 2]} ${words[words.length - 1]}`);
  }
  
  // Last three words (e.g., "rode punt paprika")
  if (words.length > 3) {
    candidates.push(`${words[words.length - 3]} ${words[words.length - 2]} ${words[words.length - 1]}`);
  }
  
  return candidates;
}

/**
 * Calculate similarity between two strings (simple Levenshtein-like)
 */
function calculateSimilarity(str1: string, str2: string): number {
  const s1 = normalizeString(str1);
  const s2 = normalizeString(str2);
  
  if (s1 === s2) return 1.0;
  if (s1.includes(s2) || s2.includes(s1)) return 0.8;
  
  // Simple character-based similarity
  const longer = s1.length > s2.length ? s1 : s2;
  const shorter = s1.length > s2.length ? s2 : s1;
  
  if (longer.length === 0) return 1.0;
  
  const distance = levenshteinDistance(longer, shorter);
  return (longer.length - distance) / longer.length;
}

/**
 * Simple Levenshtein distance calculation
 */
function levenshteinDistance(str1: string, str2: string): number {
  const matrix: number[][] = [];
  
  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }
  
  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j;
  }
  
  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  
  return matrix[str2.length][str1.length];
}

/**
 * Find best matching ingredient from candidates (optimized)
 */
function findBestMatch(candidates: string[], threshold: number = 0.7): string | null {
  let bestMatch: string | null = null;
  let bestScore = 0;
  
  // Normalize candidates once
  const normalizedCandidates = candidates.map(c => normalizeString(c));
  
  for (const candidate of normalizedCandidates) {
    // Quick exact match check first
    for (const ingredient of ALL_INGREDIENTS) {
      const normalizedIngredient = normalizeString(ingredient);
      if (candidate === normalizedIngredient) {
        return ingredient; // Exact match, return immediately
      }
    }
    
    // If no exact match, try similarity
    for (const ingredient of ALL_INGREDIENTS) {
      // Quick substring check before expensive similarity calculation
      const normalizedIngredient = normalizeString(ingredient);
      if (candidate.includes(normalizedIngredient) || normalizedIngredient.includes(candidate)) {
        if (bestScore < 0.8) {
          bestScore = 0.8;
          bestMatch = ingredient;
        }
        continue; // Skip expensive calculation for substring matches
      }
      
      // Only do expensive similarity if we haven't found a good match yet
      if (bestScore < 0.8) {
        const score = calculateSimilarity(candidate, ingredient);
        if (score > bestScore && score >= threshold) {
          bestScore = score;
          bestMatch = ingredient;
        }
      }
    }
    
    // If we found a very good match (0.8+), return early
    if (bestScore >= 0.8) {
      return bestMatch;
    }
  }
  
  return bestMatch;
}

/**
 * Map Open Food Facts categories to ingredients
 */
function mapCategoriesToIngredient(categories: string[]): string | null {
  if (!categories || categories.length === 0) return null;
  
  for (const category of categories) {
    const normalizedCategory = normalizeString(category);
    
    // Check direct mappings
    for (const [key, ingredients] of Object.entries(CATEGORY_MAPPINGS)) {
      if (normalizedCategory.includes(key.replace('en:', ''))) {
        // Try to find specific ingredient from subcategory
        const categoryParts = normalizedCategory.split(',');
        for (const part of categoryParts) {
          const trimmed = part.trim();
          for (const ingredient of ingredients) {
            if (trimmed.includes(ingredient) || ingredient.includes(trimmed)) {
              return ingredient;
            }
          }
        }
        // Return first ingredient from category if no specific match
        if (ingredients.length > 0) {
          return ingredients[0];
        }
      }
    }
  }
  
  return null;
}

/**
 * Suggest ingredient tag based on product name and categories
 */
export function suggestIngredientTag(
  productName: string,
  categories?: string[] | null
): string | null {
  if (!productName) return null;
  
  // First, try to map from categories
  if (categories && categories.length > 0) {
    const categoryMatch = mapCategoriesToIngredient(categories);
    if (categoryMatch) {
      return categoryMatch;
    }
  }
  
  // Then, try to extract from product name
  const candidates = extractIngredientFromName(productName);
  const match = findBestMatch(candidates, 0.7);
  
  return match;
}
