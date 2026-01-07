// Barcode API utilities voor product lookup

export interface NutritionFacts {
  calories: number; // kcal
  carbs: number; // g
  protein: number; // g
  fat: number; // g
  fiber?: number; // g
  sugar?: number; // g
  sodium?: number; // mg
  // Micronutriënten
  calcium?: number; // mg
  iron?: number; // mg
  vitaminC?: number; // mg
  magnesium?: number; // mg
  potassium?: number; // mg
  zinc?: number; // mg
  phosphorus?: number; // mg
  copper?: number; // mg
  selenium?: number; // mcg
}

export interface BarcodeProduct {
  barcode: string; // Verplicht: voor navigatie naar /inventory/product/[barcode]
  name: string;
  category: string;
  brand?: string;
  imageUrl?: string;
  nutritionFacts?: NutritionFacts; // Per 100g (altijd)
  servingSize?: number;
  servingUnit?: string;
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

      // Parse voedingswaarden
      const nutriments = product.nutriments || {};
      const nutritionFacts: NutritionFacts | undefined = nutriments['energy-kcal_100g'] ? {
        calories: Math.round(nutriments['energy-kcal_100g'] || 0),
        carbs: Math.round((nutriments['carbohydrates_100g'] || 0) * 10) / 10,
        protein: Math.round((nutriments['proteins_100g'] || 0) * 10) / 10,
        fat: Math.round((nutriments['fat_100g'] || 0) * 10) / 10,
        fiber: nutriments['fiber_100g'] ? Math.round((nutriments['fiber_100g'] || 0) * 10) / 10 : undefined,
        sugar: nutriments['sugars_100g'] ? Math.round((nutriments['sugars_100g'] || 0) * 10) / 10 : undefined,
        sodium: nutriments['sodium_100g'] ? Math.round((nutriments['sodium_100g'] || 0) * 1000) : undefined, // Convert to mg
        calcium: nutriments['calcium_100g'] ? Math.round((nutriments['calcium_100g'] || 0) * 1000) : undefined,
        iron: nutriments['iron_100g'] ? Math.round((nutriments['iron_100g'] || 0) * 1000) : undefined,
        vitaminC: nutriments['vitamin-c_100g'] ? Math.round((nutriments['vitamin-c_100g'] || 0) * 1000) : undefined,
        magnesium: nutriments['magnesium_100g'] ? Math.round((nutriments['magnesium_100g'] || 0) * 1000) : undefined,
        potassium: nutriments['potassium_100g'] ? Math.round((nutriments['potassium_100g'] || 0) * 1000) : undefined,
        zinc: nutriments['zinc_100g'] ? Math.round((nutriments['zinc_100g'] || 0) * 1000) : undefined,
        phosphorus: nutriments['phosphorus_100g'] ? Math.round((nutriments['phosphorus_100g'] || 0) * 1000) : undefined,
        copper: nutriments['copper_100g'] ? Math.round((nutriments['copper_100g'] || 0) * 1000) : undefined,
        selenium: nutriments['selenium_100g'] ? Math.round((nutriments['selenium_100g'] || 0) * 1000) : undefined,
      } : undefined;

      // Haal serving size op
      const servingSize = product.serving_size ? parseFloat(product.serving_size) : undefined;
      const servingUnit = product.serving_quantity ? product.serving_quantity.toString() : 
                         product.quantity ? product.quantity : undefined;

      // Map Open Food Facts data naar onze structuur
      return {
        barcode: barcode,
        name: product.product_name || product.product_name_en || 'Onbekend product',
        category: mapCategory(product.categories || ''),
        brand: product.brands || undefined,
        imageUrl: product.image_url || product.image_front_url || product.image_front_small_url || undefined,
        nutritionFacts,
        servingSize,
        servingUnit,
      };
    } catch (error) {
      console.error('Error looking up barcode:', error);
      return null;
    }
  },

  // Zoek producten via naam
  searchProducts: async (query: string, page: number = 1): Promise<BarcodeProduct[]> => {
    try {
      if (!query.trim()) {
        return [];
      }

      const searchUrl = new URL('https://world.openfoodfacts.org/cgi/search.pl');
      searchUrl.searchParams.set('search_terms', query.trim());
      searchUrl.searchParams.set('page_size', '20');
      searchUrl.searchParams.set('page', page.toString());
      searchUrl.searchParams.set('json', '1');
      searchUrl.searchParams.set('fields', 'code,product_name,product_name_en,brands,image_url,image_front_url,image_front_small_url,nutriments,serving_size,serving_quantity,quantity,categories');

      const response = await fetch(searchUrl.toString());

      if (!response.ok) {
        return [];
      }

      const data = await response.json();

      if (!data.products || data.products.length === 0) {
        return [];
      }

      // Map elk product naar BarcodeProduct
      return data.products
        .filter((p: any) => p.code) // Alleen producten met barcode
        .map((product: any) => {
          // Parse voedingswaarden (zelfde logica als lookupProduct)
          const nutriments = product.nutriments || {};
          const nutritionFacts: NutritionFacts | undefined = nutriments['energy-kcal_100g'] ? {
            calories: Math.round(nutriments['energy-kcal_100g'] || 0),
            carbs: Math.round((nutriments['carbohydrates_100g'] || 0) * 10) / 10,
            protein: Math.round((nutriments['proteins_100g'] || 0) * 10) / 10,
            fat: Math.round((nutriments['fat_100g'] || 0) * 10) / 10,
            fiber: nutriments['fiber_100g'] ? Math.round((nutriments['fiber_100g'] || 0) * 10) / 10 : undefined,
            sugar: nutriments['sugars_100g'] ? Math.round((nutriments['sugars_100g'] || 0) * 10) / 10 : undefined,
            sodium: nutriments['sodium_100g'] ? Math.round((nutriments['sodium_100g'] || 0) * 1000) : undefined,
            calcium: nutriments['calcium_100g'] ? Math.round((nutriments['calcium_100g'] || 0) * 1000) : undefined,
            iron: nutriments['iron_100g'] ? Math.round((nutriments['iron_100g'] || 0) * 1000) : undefined,
            vitaminC: nutriments['vitamin-c_100g'] ? Math.round((nutriments['vitamin-c_100g'] || 0) * 1000) : undefined,
            magnesium: nutriments['magnesium_100g'] ? Math.round((nutriments['magnesium_100g'] || 0) * 1000) : undefined,
            potassium: nutriments['potassium_100g'] ? Math.round((nutriments['potassium_100g'] || 0) * 1000) : undefined,
            zinc: nutriments['zinc_100g'] ? Math.round((nutriments['zinc_100g'] || 0) * 1000) : undefined,
            phosphorus: nutriments['phosphorus_100g'] ? Math.round((nutriments['phosphorus_100g'] || 0) * 1000) : undefined,
            copper: nutriments['copper_100g'] ? Math.round((nutriments['copper_100g'] || 0) * 1000) : undefined,
            selenium: nutriments['selenium_100g'] ? Math.round((nutriments['selenium_100g'] || 0) * 1000) : undefined,
          } : undefined;

          const servingSize = product.serving_size ? parseFloat(product.serving_size) : undefined;
          const servingUnit = product.serving_quantity ? product.serving_quantity.toString() : 
                             product.quantity ? product.quantity : undefined;

          return {
            barcode: product.code,
            name: product.product_name || product.product_name_en || 'Onbekend product',
            category: mapCategory(product.categories || ''),
            brand: product.brands || undefined,
            imageUrl: product.image_url || product.image_front_url || product.image_front_small_url || undefined,
            nutritionFacts,
            servingSize,
            servingUnit,
          };
        });
    } catch (error) {
      console.error('Error searching products:', error);
      return [];
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



