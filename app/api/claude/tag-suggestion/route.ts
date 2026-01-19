import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { productName, categories, barcode } = await request.json();

    if (!productName) {
      return NextResponse.json(
        { error: 'Product name is required' },
        { status: 400 }
      );
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { error: 'AI service not configured' },
        { status: 500 }
      );
    }

    // Build context for AI
    const categoryInfo = categories && categories.length > 0 
      ? `Categorieën: ${categories.join(', ')}`
      : '';

    const prompt = `Je bent een Nederlandse kookassistent. Geef een suggestie voor een ingrediënt tag voor het volgende product.

Product naam: ${productName}
${categoryInfo}
${barcode ? `Barcode: ${barcode}` : ''}

Geef alleen de naam van het ingrediënt terug (bijvoorbeeld: "tomaat", "ui", "melk", "kip"). 
Als het product geen basis ingrediënt is (bijvoorbeeld een kant-en-klaar product, snack, of drank), geef dan "null" terug.
Geef alleen de tag naam, geen uitleg of andere tekst.`;

    const message = await anthropic.messages.create({
      model: 'claude-opus-4-5-20251101',
      max_tokens: 50,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    const suggestedTag = message.content[0].type === 'text' 
      ? message.content[0].text.trim().toLowerCase()
      : null;

    // Validate tag - if it's "null" or empty, return null
    if (!suggestedTag || suggestedTag === 'null' || suggestedTag.length === 0) {
      return NextResponse.json({ tag: null });
    }

    return NextResponse.json({ tag: suggestedTag });
  } catch (error) {
    console.error('Error getting AI tag suggestion:', error);
    return NextResponse.json(
      { error: 'Failed to get tag suggestion' },
      { status: 500 }
    );
  }
}
