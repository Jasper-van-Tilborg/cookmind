import { NextRequest, NextResponse } from 'next/server';
import { EXCLUSION_KEYWORDS, EXCLUSION_CATEGORIES, INCLUSION_CATEGORIES } from '@/lib/constants/ingredients';

function normalizeString(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

function shouldExcludeProduct(product: any): boolean {
  const name = normalizeString(
    product.product_name || product.product_name_en || product.product_name_nl || ''
  );
  
  // Check exclusion keywords in product name
  for (const keyword of EXCLUSION_KEYWORDS) {
    if (name.includes(keyword)) {
      return true;
    }
  }
  
  // Check categories
  const categories = product.categories_tags || product.categories || [];
  const categoryString = Array.isArray(categories) 
    ? categories.join(',').toLowerCase()
    : String(categories).toLowerCase();
  
  // Exclude if any exclusion category is present
  for (const exclusionCategory of EXCLUSION_CATEGORIES) {
    if (categoryString.includes(exclusionCategory)) {
      return true;
    }
  }
  
  return false;
}

function hasInclusionCategory(product: any): boolean {
  const categories = product.categories_tags || product.categories || [];
  const categoryString = Array.isArray(categories)
    ? categories.join(',').toLowerCase()
    : String(categories).toLowerCase();
  
  // Check if any inclusion category is present
  for (const inclusionCategory of INCLUSION_CATEGORIES) {
    if (categoryString.includes(inclusionCategory)) {
      return true;
    }
  }
  
  return false;
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get('query');

  if (!query) {
    return NextResponse.json(
      { error: 'Search query is required' },
      { status: 400 }
    );
  }

  try {
    const response = await fetch(
      `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(query)}&page_size=25&json=1&fields=code,product_name,product_name_en,product_name_nl,image_url,image_front_url,image_front_small_url,brands,brand,quantity,categories,categories_tags`
    );

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to search products' },
        { status: 500 }
      );
    }

    const data = await response.json();

    if (!data.products || data.products.length === 0) {
      return NextResponse.json({ products: [] });
    }

    // Filter and transform products
    const filteredProducts = data.products
      .filter((product: any) => {
        // Must have a name
        if (!product.product_name && !product.product_name_en && !product.product_name_nl) {
          return false;
        }
        
        // Exclude products with exclusion keywords/categories
        if (shouldExcludeProduct(product)) {
          return false;
        }
        
        // Prefer products with inclusion categories, but don't exclude others
        // (we want to show some results even if categories are unclear)
        return true;
      })
      .sort((a: any, b: any) => {
        // Prioritize products with inclusion categories
        const aHasInclusion = hasInclusionCategory(a);
        const bHasInclusion = hasInclusionCategory(b);
        
        if (aHasInclusion && !bHasInclusion) return -1;
        if (!aHasInclusion && bHasInclusion) return 1;
        return 0;
      })
      .slice(0, 15) // Limit to 15 results for faster loading
      .map((product: any) => {
        const categories = product.categories_tags || product.categories || [];
        const categoriesArray = Array.isArray(categories) ? categories : [categories];
        
        return {
          barcode: product.code || null,
          name: product.product_name || product.product_name_en || product.product_name_nl || 'Onbekend product',
          image: product.image_url || product.image_front_url || product.image_front_small_url || null,
          brand: product.brands || product.brand || null,
          quantity: product.quantity || null,
          categories: categoriesArray.filter((c: any) => c),
        };
      });

    return NextResponse.json({ products: filteredProducts });
  } catch (error) {
    console.error('Error searching products from Open Food Facts:', error);
    return NextResponse.json(
      { error: 'Failed to search products' },
      { status: 500 }
    );
  }
}
