import Anthropic from '@anthropic-ai/sdk';
import { Recipe, Substitution, InventoryItem, VariantCheckResult } from '@/src/types';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
});

export interface SubstitutionResult {
  substitutions: Substitution[];
  updatedSteps?: string[];
}

/**
 * Genereert AI substituties voor een ontbrekend ingrediënt
 */
export async function getSubstitutions(
  missingIngredient: string,
  userInventory: InventoryItem[],
  recipe: Recipe
): Promise<SubstitutionResult> {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error('ANTHROPIC_API_KEY is niet geconfigureerd');
  }

  const inventoryNames = userInventory.map(item => item.name).join(', ');
  const recipeIngredients = recipe.ingredients.map(ing => `${ing.name} (${ing.amount} ${ing.unit})`).join(', ');
  const recipeSteps = recipe.steps.join('\n');

  const prompt = `Je bent een culinaire AI assistent. Een gebruiker heeft een recept voor "${recipe.title}" maar mist het ingrediënt "${missingIngredient}".

Huidige ingrediënten in het recept:
${recipeIngredients}

Bereidingswijze:
${recipeSteps}

De gebruiker heeft de volgende producten in voorraad:
${inventoryNames}

Geef 2-3 substituties voor "${missingIngredient}" die:
1. Alleen producten gebruiken die de gebruiker WERKELIJK in voorraad heeft (uit de lijst hierboven)
2. Het recept zo veel mogelijk behouden qua smaak en textuur
3. Realistisch en praktisch zijn

Geef je antwoord als JSON in dit exacte format:
{
  "substitutions": [
    {
      "original": "${missingIngredient}",
      "substitute": "naam van substitutie",
      "reason": "korte uitleg waarom dit een goede substitutie is",
      "adjustments": "eventuele aanpassingen aan kooktijd of bereiding (optioneel)"
    }
  ],
  "updatedSteps": [
    "aangepaste stap 1 met substitutie",
    "aangepaste stap 2 met substitutie",
    "..."
  ]
}

Belangrijk: 
- Gebruik ALLEEN producten uit de voorraad lijst
- updatedSteps moet alle stappen bevatten, niet alleen de aangepaste
- Wees specifiek en praktisch
- Antwoord ALLEEN met JSON, geen extra tekst`;

  try {
    const message = await anthropic.messages.create({
      model: 'claude-opus-4-5-20251101',
      max_tokens: 2000,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    const content = message.content[0];
    if (content.type !== 'text') {
      throw new Error('Ongeldig antwoord van AI');
    }

    // Parse JSON uit de response
    const jsonMatch = content.text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Geen JSON gevonden in AI response');
    }

    const result = JSON.parse(jsonMatch[0]) as SubstitutionResult;
    
    // Valideer dat substituties in voorraad zijn
    const inventoryNamesLower = userInventory.map(item => item.name.toLowerCase());
    result.substitutions = result.substitutions.filter(sub => 
      inventoryNamesLower.some(inv => 
        inv.includes(sub.substitute.toLowerCase()) || 
        sub.substitute.toLowerCase().includes(inv)
      )
    );

    return result;
  } catch (error) {
    console.error('Error getting substitutions:', error);
    throw error;
  }
}

/**
 * Past een recept aan met AI op basis van een gebruiker prompt
 */
export async function tweakRecipe(
  recipe: Recipe,
  userPrompt: string,
  userInventory: InventoryItem[]
): Promise<Recipe> {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error('ANTHROPIC_API_KEY is niet geconfigureerd');
  }

  const inventoryNames = userInventory.map(item => item.name).join(', ');
  const recipeIngredients = recipe.ingredients.map(ing => `${ing.name} (${ing.amount} ${ing.unit})`).join(', ');

  const prompt = `Je bent een culinaire AI assistent. Een gebruiker wil een recept aanpassen.

Origineel recept:
Titel: ${recipe.title}
Beschrijving: ${recipe.description}
Bereidingstijd: ${recipe.prepTime} minuten
Aantal personen: ${recipe.servings}
Moeilijkheidsgraad: ${recipe.difficulty}

Ingrediënten:
${recipeIngredients}

Bereidingswijze:
${recipe.steps.join('\n')}

Gebruiker voorraad:
${inventoryNames}

Gebruiker verzoek: "${userPrompt}"

Pas het recept aan volgens het verzoek van de gebruiker. Gebruik zoveel mogelijk ingrediënten uit de voorraad van de gebruiker.

Geef je antwoord als JSON in dit exacte format:
{
  "title": "aangepaste titel",
  "description": "aangepaste beschrijving",
  "prepTime": aantal minuten,
  "servings": aantal personen,
  "difficulty": "Makkelijk" | "Gemiddeld" | "Moeilijk",
  "ingredients": [
    {
      "name": "ingrediënt naam",
      "amount": aantal,
      "unit": "eenheid"
    }
  ],
  "steps": [
    "stap 1",
    "stap 2",
    "..."
  ],
  "tags": ["tag1", "tag2"]
}

Belangrijk:
- Behoud de structuur van het originele recept
- Gebruik ingrediënten uit de voorraad waar mogelijk
- Pas alles aan volgens het verzoek van de gebruiker
- Wees creatief maar praktisch
- Antwoord ALLEEN met JSON, geen extra tekst`;

  try {
    const message = await anthropic.messages.create({
      model: 'claude-opus-4-5-20251101',
      max_tokens: 3000,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    const content = message.content[0];
    if (content.type !== 'text') {
      throw new Error('Ongeldig antwoord van AI');
    }

    // Parse JSON uit de response
    const jsonMatch = content.text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Geen JSON gevonden in AI response');
    }

    const tweakedRecipe = JSON.parse(jsonMatch[0]) as Recipe;
    
    // Behoud originele ID en imageUrl
    tweakedRecipe.id = recipe.id;
    tweakedRecipe.imageUrl = recipe.imageUrl;

    return tweakedRecipe;
  } catch (error) {
    console.error('Error tweaking recipe:', error);
    throw error;
  }
}

/**
 * Check of een variant van een basisvoorraad item acceptabel is
 */
export async function checkVariantAcceptability(
  recipeIngredient: string,
  userBasicInventory: string[],
  recipe: Recipe
): Promise<VariantCheckResult> {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error('ANTHROPIC_API_KEY is niet geconfigureerd');
  }

  const recipeIngredients = recipe.ingredients.map(ing => `${ing.name} (${ing.amount} ${ing.unit})`).join(', ');
  const recipeSteps = recipe.steps.join('\n');

  const prompt = `Je bent een culinaire AI assistent. Een gebruiker heeft een recept voor "${recipe.title}".

Het recept vraagt om: "${recipeIngredient}"

De gebruiker heeft de volgende basisvoorraad items in huis:
${userBasicInventory.join(', ')}

Bepaal of "${recipeIngredient}" een variant is van een van de basisvoorraad items en of deze variant acceptabel is.

Huidige ingrediënten in het recept:
${recipeIngredients}

Bereidingswijze:
${recipeSteps}

Geef je antwoord als JSON in dit exacte format:
{
  "acceptable": true/false,
  "needsVariant": true/false,
  "basicItem": "naam van basisvoorraad item (bijv. Olijfolie)",
  "variant": "${recipeIngredient}",
  "message": "duidelijke, vriendelijke boodschap voor de gebruiker"
}

Regels:
- Als de variant acceptabel is (geen verschil): 
  - acceptable: true
  - needsVariant: false
  - message: "Oorspronkelijk is het [variant], maar jij hebt [basisitem]. Heb je [variant]? Zo niet, maakt het niet uit."
  
- Als de variant nodig is (verschil maakt uit):
  - acceptable: false
  - needsVariant: true
  - message: "Heb je ipv [basisitem] ook [variant] in huis?"

- Als het geen variant is van basisvoorraad:
  - acceptable: false
  - needsVariant: false
  - message: ""

Wees specifiek en praktisch. Antwoord ALLEEN met JSON, geen extra tekst`;

  try {
    const message = await anthropic.messages.create({
      model: 'claude-opus-4-5-20251101',
      max_tokens: 1000,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    const content = message.content[0];
    if (content.type !== 'text') {
      throw new Error('Ongeldig antwoord van AI');
    }

    // Parse JSON uit de response
    const jsonMatch = content.text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Geen JSON gevonden in AI response');
    }

    const result = JSON.parse(jsonMatch[0]) as VariantCheckResult;
    return result;
  } catch (error) {
    console.error('Error checking variant acceptability:', error);
    throw error;
  }
}


