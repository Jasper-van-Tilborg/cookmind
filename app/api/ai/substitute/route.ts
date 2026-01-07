import { NextRequest, NextResponse } from 'next/server';
import { getSubstitutions } from '@/src/lib/ai';
import { mockRecipes } from '@/src/lib/data';
import { InventoryItem } from '@/src/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { recipeId, missingIngredient, userInventory } = body;

    if (!recipeId || !missingIngredient || !userInventory) {
      return NextResponse.json(
        { error: 'recipeId, missingIngredient en userInventory zijn verplicht' },
        { status: 400 }
      );
    }

    // Vind het recept
    const recipe = mockRecipes.find(r => r.id === recipeId);
    if (!recipe) {
      return NextResponse.json(
        { error: 'Recept niet gevonden' },
        { status: 404 }
      );
    }

    // Converteer userInventory naar InventoryItem format
    const inventoryItems: InventoryItem[] = userInventory.map((item: any, index: number) => ({
      id: item.id || index,
      name: item.name,
      category: item.category || 'Overig',
      quantity: item.quantity || 1,
      unit: item.unit,
      expiry: item.expiry ? new Date(item.expiry) : undefined,
    }));

    // Haal substituties op via AI
    const result = await getSubstitutions(
      missingIngredient,
      inventoryItems,
      recipe
    );

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error in substitute API:', error);
    return NextResponse.json(
      { error: error.message || 'Er is een fout opgetreden bij het ophalen van substituties' },
      { status: 500 }
    );
  }
}


