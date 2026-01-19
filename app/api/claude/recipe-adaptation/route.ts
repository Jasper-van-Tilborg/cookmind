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
      ? missingIngredients.join(', ')
      : null;

    const ingredientsText = recipe.ingredients
      .map((ing) => `- ${ing.amount} ${ing.unit} ${ing.name}`)
      .join('\n');

    const instructionsText = recipe.instructions
      .map((inst, idx) => `${idx + 1}. ${inst}`)
      .join('\n');

    const aiPrompt = `Je bent een professionele Nederlandse kookassistent. Je ontvangt een compleet recept en een verzoek van de gebruiker om het recept aan te passen.

COMPLEET ORIGINEEL RECEPT:
Titel: ${recipe.title}
${recipe.description ? `Beschrijving: ${recipe.description}` : ''}

Ingrediënten:
${ingredientsText}

Bereidingswijze (stap voor stap):
${instructionsText}
${missingIngredientsText ? `\n\nLET OP: De volgende ingrediënten ontbreken in de voorraad van de gebruiker: ${missingIngredientsText}. Houd hier rekening mee bij het aanpassen van het recept.` : '\n\nLET OP: Alle ingrediënten zijn beschikbaar in de voorraad van de gebruiker.'}

GEBRUIKERSVERZOEK:
"${prompt}"

JOUW TAAK:
Pas het volledige recept aan volgens het gebruikersverzoek. Dit betekent:
1. Pas de ingrediëntenlijst aan (verwijder ingrediënten die niet meer nodig zijn, voeg nieuwe toe indien nodig, pas hoeveelheden aan)
2. Pas de bereidingswijze aan zodat deze logisch aansluit bij de nieuwe ingrediënten
3. Pas de titel aan als dat logisch is (bijv. "Vegetarische Pasta Carbonara" in plaats van "Pasta Carbonara")
4. Pas de beschrijving aan als dat relevant is

BELANGRIJK:
- Je moet het COMPLETE recept aanpassen, niet alleen delen ervan
- Alle instructies moeten logisch zijn en aansluiten bij de aangepaste ingrediënten
- Behoud de Nederlandse taal
- Gebruik dezelfde units (gram, ml, stuks, etc.)
- Zorg dat ingredient_tag matcht met standaard ingredient tags (bijv. "ui", "knoflook", "kip", "tomaat", "spaghetti", "eieren", etc.) of null als geen match
- Als het verzoek "maak dit vegetarisch" is, vervang vlees/vis door vegetarische alternatieven en pas de instructies aan
- Als het verzoek "maak het sneller" is, vereenvoudig de stappen en verminder kooktijden
- Zorg dat het recept compleet en uitvoerbaar is

Geef je antwoord terug in het volgende JSON format (geen markdown, alleen pure JSON, geen extra tekst):
{
  "title": "Aangepaste titel van het recept",
  "description": "Aangepaste beschrijving (kan null zijn)",
  "instructions": ["Stap 1 van de aangepaste bereidingswijze", "Stap 2 van de aangepaste bereidingswijze", "Stap 3", ...],
  "ingredients": [
    {"name": "ingrediënt naam", "amount": 100, "unit": "gram", "ingredient_tag": "tag of null"},
    ...
  ]
}`;

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
