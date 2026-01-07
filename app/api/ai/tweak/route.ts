import { NextRequest, NextResponse } from 'next/server';
import { tweakRecipe } from '@/src/lib/ai';
import { InventoryItem, Recipe } from '@/src/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { recipe, userPrompt, userInventory } = body;

    if (!recipe || !userPrompt || !userInventory) {
      return NextResponse.json(
        { error: 'recipe, userPrompt en userInventory zijn verplicht' },
        { status: 400 }
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

    // Converteer recipe naar Recipe format
    const recipeObj: Recipe = {
      id: recipe.id,
      title: recipe.title,
      description: recipe.description,
      prepTime: recipe.prepTime,
      servings: recipe.servings,
      difficulty: recipe.difficulty,
      ingredients: recipe.ingredients,
      steps: recipe.steps,
      imageUrl: recipe.imageUrl,
      tags: recipe.tags,
    };

    // Pas recept aan met AI
    const tweakedRecipe = await tweakRecipe(recipeObj, userPrompt, inventoryItems);

    return NextResponse.json({ modifiedRecipe: tweakedRecipe });
  } catch (error: any) {
    console.error('Error in tweak API:', error);
    return NextResponse.json(
      { error: error.message || 'Er is een fout opgetreden bij het aanpassen van het recept' },
      { status: 500 }
    );
  }
}




