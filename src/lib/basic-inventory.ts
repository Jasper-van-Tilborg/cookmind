import { InventoryItem } from '@/src/types';

export interface BasicInventoryItem {
  name: string;
  category: string;
  quantity: number;
  unit?: string;
}

/**
 * Minimale lijst van essentiële basisvoorraad items
 */
export const BASIC_INVENTORY_ITEMS: BasicInventoryItem[] = [
  { name: 'Zout', category: 'Kruiden', quantity: 1, unit: 'pak' },
  { name: 'Peper', category: 'Kruiden', quantity: 1, unit: 'potje' },
  { name: 'Boter', category: 'Zuivel', quantity: 250, unit: 'g' },
  { name: 'Olijfolie', category: 'Oliën', quantity: 1, unit: 'fles' },
];

/**
 * Variant mappings voor basisvoorraad items
 * Definieert welke varianten mogelijk zijn voor elk basisvoorraad item
 */
export const VARIANT_MAPPINGS: Record<string, string[]> = {
  'Olijfolie': ['Zonnebloemolie', 'Arachideolie', 'Koolzaadolie', 'Zonnebloemolie', 'Plantaardige olie'],
  'Boter': ['Margarine', 'Roomboter', 'Geklaarde boter'],
  'Zout': ['Zeezout', 'Tafelzout', 'Kosher zout'],
  'Peper': ['Zwarte peper', 'Witte peper', 'Pepermengsel'],
};

/**
 * Check of een item in de basisvoorraad lijst zit
 */
export function isBasicInventoryItem(name: string): boolean {
  const normalizedName = name.toLowerCase().trim();
  return BASIC_INVENTORY_ITEMS.some(item => 
    item.name.toLowerCase() === normalizedName
  );
}

/**
 * Haal alle varianten op voor een basisvoorraad item
 */
export function getBasicInventoryVariants(basicItem: string): string[] {
  const normalizedBasicItem = basicItem.toLowerCase().trim();
  const basicItemName = BASIC_INVENTORY_ITEMS.find(item => 
    item.name.toLowerCase() === normalizedBasicItem
  )?.name;

  if (!basicItemName) return [];

  return VARIANT_MAPPINGS[basicItemName] || [];
}

/**
 * Check of een recept ingrediënt een variant is van een basisvoorraad item
 */
export function isVariantOfBasicInventory(
  recipeIngredient: string,
  userInventory: string[]
): { isVariant: boolean; basicItem?: string; variant?: string } {
  const normalizedRecipeIngredient = recipeIngredient.toLowerCase().trim();

  // Check alle basisvoorraad items
  for (const basicItem of BASIC_INVENTORY_ITEMS) {
    const basicItemName = basicItem.name.toLowerCase();
    
    // Check of gebruiker het basis item heeft
    const hasBasicItem = userInventory.some(inv => {
      const normalizedInv = inv.toLowerCase().trim();
      return normalizedInv === basicItemName || 
             normalizedInv.includes(basicItemName) || 
             basicItemName.includes(normalizedInv);
    });

    if (!hasBasicItem) continue;

    // Check of recept ingrediënt direct match is met basis item (dan is het geen variant)
    if (normalizedRecipeIngredient === basicItemName ||
        normalizedRecipeIngredient.includes(basicItemName) ||
        basicItemName.includes(normalizedRecipeIngredient)) {
      return { isVariant: false };
    }

    // Check of recept ingrediënt een variant is
    const variants = getBasicInventoryVariants(basicItem.name);
    for (const variant of variants) {
      const normalizedVariant = variant.toLowerCase().trim();
      if (
        normalizedRecipeIngredient === normalizedVariant ||
        normalizedRecipeIngredient.includes(normalizedVariant) ||
        normalizedVariant.includes(normalizedRecipeIngredient)
      ) {
        return {
          isVariant: true,
          basicItem: basicItem.name,
          variant: recipeIngredient,
        };
      }
    }
  }

  return { isVariant: false };
}

/**
 * Converteer BasicInventoryItem naar InventoryItem (zonder id)
 */
export function basicInventoryToInventoryItem(
  item: BasicInventoryItem
): Omit<InventoryItem, 'id'> {
  return {
    name: item.name,
    category: item.category,
    quantity: item.quantity,
    unit: item.unit,
  };
}

