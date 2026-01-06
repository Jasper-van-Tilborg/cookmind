// Barcode API utilities voor product lookup

export interface BarcodeProduct {
  name: string;
  category: string;
  brand?: string;
  imageUrl?: string;
}

// Open Food Facts API voor product lookup
export const barcodeAPI = {
  // Haal product informatie op via barcode
  lookupProduct: async (barcode: string): Promise<BarcodeProduct | null> => {
    try {
      // Open Food Facts API
      const response = await fetch(
        `https://world.openfoodfacts.org/api/v0/product/${barcode}.json`
      );

      if (!response.ok) {
        return null;
      }

      const data = await response.json();

      if (data.status === 0 || !data.product) {
        return null;
      }

      const product = data.product;

      // Map Open Food Facts data naar onze structuur
      return {
        name: product.product_name || product.product_name_en || 'Onbekend product',
        category: mapCategory(product.categories || ''),
        brand: product.brands || undefined,
        imageUrl: product.image_url || product.image_front_url || undefined,
      };
    } catch (error) {
      console.error('Error looking up barcode:', error);
      return null;
    }
  },
};

// Map Open Food Facts categorieën naar onze categorieën
function mapCategory(categories: string): string {
  const categoryLower = categories.toLowerCase();

  if (categoryLower.includes('vegetable') || categoryLower.includes('groente')) {
    return 'Groente';
  }
  if (categoryLower.includes('fruit')) {
    return 'Fruit';
  }
  if (categoryLower.includes('meat') || categoryLower.includes('vlees')) {
    return 'Vlees';
  }
  if (categoryLower.includes('dairy') || categoryLower.includes('zuivel')) {
    return 'Zuivel';
  }
  if (categoryLower.includes('grain') || categoryLower.includes('graan')) {
    return 'Graan';
  }
  if (categoryLower.includes('spice') || categoryLower.includes('kruid')) {
    return 'Kruiden';
  }

  return 'Overig';
}


