import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

interface RecipeData {
  title: string;
  description?: string | null;
  instructions: string[];
  ingredients: Array<{
    name: string;
    amount: number;
    unit: string;
    ingredient_tag: string | null;
  }>;
  missingIngredients?: string[];
}

export async function POST(request: NextRequest) {
  try {
    const { recipe, prompt, missingIngredients }: { recipe: RecipeData; prompt: string; missingIngredients?: string[] } = await request.json();

    if (!recipe || !prompt) {
      return NextResponse.json(
        { error: 'Recipe and prompt are required' },
        { status: 400 }
      );
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      console.error('ANTHROPIC_API_KEY is not set in environment variables');
      return NextResponse.json(
        { error: 'AI service not configured. Please check that ANTHROPIC_API_KEY is set in .env.local (with underscore, not dash)' },
        { status: 500 }
      );
    }

    // Build context for AI
    const missingIngredientsText = missingIngredients && missingIngredients.length > 0
      ? `\n\nOntbrekende ingrediënten: ${missingIngredients.join(', ')}`
      : '';

    const ingredientsText = recipe.ingredients
      .map((ing) => `- ${ing.amount} ${ing.unit} ${ing.name}`)
      .join('\n');

    const instructionsText = recipe.instructions
      .map((inst, idx) => `${idx + 1}. ${inst}`)
      .join('\n');

    const aiPrompt = `Je bent een professionele Nederlandse kookassistent. Pas het volgende recept aan volgens de wens van de gebruiker.

ORIGINEEL RECEPT:
Titel: ${recipe.title}
${recipe.description ? `Beschrijving: ${recipe.description}` : ''}

Ingrediënten:
${ingredientsText}

Bereidingswijze:
${instructionsText}
${missingIngredientsText}

GEBRUIKERSWENS:
${prompt}

OPDRACHT:
Pas het recept aan volgens de gebruikerswens. Behoud de structuur en het format, maar pas de ingrediënten en/of bereidingswijze aan waar nodig. Zorg dat het recept logisch en uitvoerbaar blijft.

Geef je antwoord terug in het volgende JSON format (geen markdown, alleen pure JSON):
{
  "title": "Aangepaste titel van het recept",
  "description": "Optionele beschrijving (kan null zijn)",
  "instructions": ["Stap 1", "Stap 2", "Stap 3", ...],
  "ingredients": [
    {"name": "ingrediënt naam", "amount": 100, "unit": "gram", "ingredient_tag": "tag of null"},
    ...
  ]
}

Belangrijk:
- Behoud Nederlandse taal
- Gebruik dezelfde units (gram, ml, stuks, etc.)
- Zorg dat ingredient_tag matcht met standaard ingredient tags (bijv. "ui", "knoflook", "kip", "tomaat", etc.) of null als geen match
- Maak logische aanpassingen die het recept verbeteren of aanpassen aan de wens
- Als de wens niet uitvoerbaar is, geef dan een redelijke alternatieve aanpassing`;

    const message = await anthropic.messages.create({
      model: 'claude-opus-4-5-20251101',
      max_tokens: 4000,
      messages: [
        {
          role: 'user',
          content: aiPrompt,
        },
      ],
    });

    const responseText = message.content[0].type === 'text' 
      ? message.content[0].text.trim()
      : null;

    if (!responseText) {
      return NextResponse.json(
        { error: 'No response from AI' },
        { status: 500 }
      );
    }

    // Parse JSON from response (remove markdown code blocks if present)
    let jsonText = responseText;
    if (jsonText.includes('```json')) {
      jsonText = jsonText.split('```json')[1].split('```')[0].trim();
    } else if (jsonText.includes('```')) {
      jsonText = jsonText.split('```')[1].split('```')[0].trim();
    }

    try {
      const adaptedRecipe = JSON.parse(jsonText);

      // Validate response structure
      if (!adaptedRecipe.title || !Array.isArray(adaptedRecipe.instructions) || !Array.isArray(adaptedRecipe.ingredients)) {
        return NextResponse.json(
          { error: 'Invalid response format from AI' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        title: adaptedRecipe.title,
        description: adaptedRecipe.description || null,
        instructions: adaptedRecipe.instructions,
        ingredients: adaptedRecipe.ingredients,
      });
    } catch (parseError) {
      console.error('Error parsing AI response:', parseError);
      console.error('Response text:', responseText);
      return NextResponse.json(
        { error: 'Failed to parse AI response', details: responseText },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error in recipe adaptation API:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Failed to adapt recipe', details: errorMessage },
      { status: 500 }
    );
  }
}
