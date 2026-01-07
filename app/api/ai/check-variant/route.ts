import { NextRequest, NextResponse } from 'next/server';
import { checkVariantAcceptability } from '@/src/lib/ai';
import { mockRecipes } from '@/src/lib/data';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { recipeId, recipeIngredient, userBasicInventory } = body;

    if (!recipeId || !recipeIngredient || !userBasicInventory) {
      return NextResponse.json(
        { error: 'recipeId, recipeIngredient en userBasicInventory zijn verplicht' },
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

    // Check variant acceptabiliteit via AI
    const result = await checkVariantAcceptability(
      recipeIngredient,
      userBasicInventory,
      recipe
    );

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error in check-variant API:', error);
    return NextResponse.json(
      { error: error.message || 'Er is een fout opgetreden bij het checken van de variant' },
      { status: 500 }
    );
  }
}

