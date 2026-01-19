'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/client';
import BackButton from '@/components/auth/BackButton';
import QuantitySelector from '@/components/product/QuantitySelector';
import ExpiryDateSelector from '@/components/product/ExpiryDateSelector';
import { suggestIngredientTag } from '@/lib/utils/productTagging';

interface ProductData {
  barcode: string | null;
  name: string;
  image: string | null;
  brand: string | null;
  quantity: string | null;
  categories: string | null;
  categories_tags: string[] | null;
  nutrition: {
    calories: number | null;
    carbohydrates: number | null;
    proteins: number | null;
    fat: number | null;
  };
}

export default function ProductPage() {
  const router = useRouter();
  const params = useParams();
  const supabase = createClient();
  const barcode = params.id as string;

  const [product, setProduct] = useState<ProductData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [multiplier, setMultiplier] = useState(1);
  const [quantityPerItem, setQuantityPerItem] = useState('1 stuks');
  const [expiryDay, setExpiryDay] = useState<number | null>(null);
  const [expiryMonth, setExpiryMonth] = useState<number | null>(null);
  const [expiryYear, setExpiryYear] = useState<number | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  // Load product data
  useEffect(() => {
    const loadProduct = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Check if id is a barcode (numeric) or product name (encoded)
        const isBarcode = /^\d+$/.test(barcode);
        
        let response;
        if (isBarcode) {
          // It's a barcode, fetch from Open Food Facts
          response = await fetch(`/api/openfoodfacts?barcode=${encodeURIComponent(barcode)}`);
        } else {
          // It's a product name, try to search for it
          const productName = decodeURIComponent(barcode);
          const searchResponse = await fetch(`/api/openfoodfacts/search?query=${encodeURIComponent(productName)}`);
          
          if (!searchResponse.ok) {
            throw new Error('Product niet gevonden');
          }
          
          const searchData = await searchResponse.json();
          const foundProduct = searchData.products?.[0];
          
          if (!foundProduct) {
            throw new Error('Product niet gevonden');
          }
          
          // If found product has barcode, fetch full details
          if (foundProduct.barcode) {
            response = await fetch(`/api/openfoodfacts?barcode=${encodeURIComponent(foundProduct.barcode)}`);
          } else {
            // Use search result data directly (limited info)
            const productData: ProductData = {
              barcode: null,
              name: foundProduct.name,
              image: foundProduct.image,
              brand: foundProduct.brand,
              quantity: foundProduct.quantity,
              categories: foundProduct.categories?.[0] || null,
              categories_tags: foundProduct.categories || null,
              nutrition: {
                calories: null,
                carbohydrates: null,
                proteins: null,
                fat: null,
              },
            };
            setProduct(productData);
            setIsLoading(false);
            return;
          }
        }

        if (!response || !response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Product niet gevonden');
        }

        const productData: ProductData = await response.json();
        setProduct(productData);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Fout bij ophalen product';
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    if (barcode) {
      loadProduct();
    }
  }, [barcode]);

  // Calculate total quantity
  const calculateTotalQuantity = (): { value: number; unit: string } => {
    const match = quantityPerItem.match(/(\d+)\s*(g|kg|ml|l|stuks?)/i);
    if (match) {
      const value = parseInt(match[1]);
      const unit = match[2].toLowerCase();
      const totalValue = value * multiplier;

      // Convert to appropriate unit
      if (unit === 'g' && totalValue >= 1000) {
        return { value: totalValue / 1000, unit: 'kg' };
      } else if (unit === 'ml' && totalValue >= 1000) {
        return { value: totalValue / 1000, unit: 'l' };
      } else {
        return { value: totalValue, unit: unit === 'stuks' ? 'stuks' : unit };
      }
    }
    return { value: multiplier, unit: 'stuks' };
  };

  const handleAddProduct = async () => {
    if (!product) return;

    setIsAdding(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Niet ingelogd');
      }

      // Calculate total quantity
      const { value: totalQuantity, unit } = calculateTotalQuantity();

      // Get suggested tag
      const suggestedTag = suggestIngredientTag(
        product.name,
        product.categories_tags || (product.categories ? [product.categories] : null)
      );

      // Build expiry date if all fields are filled
      let expiryDate: string | null = null;
      if (expiryDay && expiryMonth && expiryYear) {
        const date = new Date(expiryYear, expiryMonth - 1, expiryDay);
        expiryDate = date.toISOString().split('T')[0]; // Format as YYYY-MM-DD
      }

      // Build details string
      const detailsParts: string[] = [];
      if (product.brand) {
        detailsParts.push(product.brand);
      }
      if (product.quantity) {
        detailsParts.push(product.quantity);
      }
      const details = detailsParts.length > 0 ? detailsParts.join(' - ') : null;

      // Prepare insert data
      const insertData: any = {
        user_id: user.id,
        product_name: product.name,
        product_image: product.image,
        quantity: totalQuantity,
        unit: unit,
        details: details,
      };

      // Add optional fields
      if (suggestedTag !== null) {
        insertData.ingredient_tag = suggestedTag;
      }

      if (expiryDate) {
        insertData.expiry_date = expiryDate;
      }

      // Insert product
      const { error: insertError } = await supabase.from('inventory').insert(insertData);

      if (insertError) {
        // Check if it's a column doesn't exist error
        const errorCode = insertError?.code;
        const errorMessage = insertError?.message || '';
        const isColumnError =
          errorCode === '42703' ||
          errorMessage.toLowerCase().includes('column') ||
          errorMessage.toLowerCase().includes('does not exist');

        if (isColumnError) {
          // Try without optional columns
          const retryData: any = {
            user_id: user.id,
            product_name: product.name,
            product_image: product.image,
            quantity: totalQuantity,
            unit: unit,
            details: details,
          };

          if (suggestedTag !== null) {
            retryData.ingredient_tag = suggestedTag;
          }

          const { error: retryError } = await supabase.from('inventory').insert(retryData);

          if (retryError) {
            throw new Error('Fout bij toevoegen aan voorraad');
          }
        } else {
          throw new Error('Fout bij toevoegen aan voorraad');
        }
      }

      // Navigate back to inventory page
      router.push('/');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Fout bij toevoegen product';
      setError(errorMessage);
      setIsAdding(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FAFAF7]">
        <div className="text-center">
          <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-[#1F6F54] border-t-transparent mx-auto"></div>
          <p className="text-[#2B2B2B]">Product laden...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="flex min-h-screen flex-col bg-[#FAFAF7] p-6">
        <div className="mb-6">
          <BackButton />
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="text-center">
            <p className="mb-4 text-lg font-semibold text-[#2B2B2B]">
              {error || 'Product niet gevonden'}
            </p>
            <button
              onClick={() => router.push('/')}
              className="rounded-lg bg-[#1F6F54] px-6 py-3 text-white transition-colors hover:bg-[#1a5d47]"
            >
              Terug naar voorraad
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#FAFAF7]">
      {/* Header */}
      <div className="sticky top-0 z-10 flex items-center justify-between bg-[#FAFAF7] p-4">
        <BackButton />
        <button
          className="flex h-10 w-10 items-center justify-center rounded-full bg-[#E5E5E0] transition-colors hover:bg-[#D5D5D0]"
          aria-label="Favoriet"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="text-[#1F6F54]"
          >
            <path
              d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 pb-6">
        {/* Product Image */}
        <div className="mb-4 flex justify-center">
          {product.image ? (
            <Image
              src={product.image}
              alt={product.name}
              width={160}
              height={160}
              className="rounded-xl object-cover"
            />
          ) : (
            <div className="flex h-[160px] w-[160px] items-center justify-center rounded-xl bg-[#9FC5B5]">
              <svg
                width="60"
                height="60"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="text-[#1F6F54]"
              >
                <path
                  d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          )}
        </div>

        {/* Product Name */}
        <h1 className="mb-4 text-center text-xl font-bold text-[#2B2B2B]">
          {product.name}
        </h1>

        {/* Nutritional Information */}
        {product.nutrition && (
          <div className="mb-4 rounded-xl bg-[#E5E5E0] p-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs text-[#2B2B2B]/60">Caloriën</p>
                <p className="text-lg font-semibold text-[#1F6F54]">
                  {product.nutrition.calories ? Math.round(product.nutrition.calories) : '-'}
                </p>
              </div>
              <div>
                <p className="text-xs text-[#2B2B2B]/60">Koolhydraten (g)</p>
                <p className="text-lg font-semibold text-[#E91E63]">
                  {product.nutrition.carbohydrates ? Math.round(product.nutrition.carbohydrates) : '-'}
                </p>
              </div>
              <div>
                <p className="text-xs text-[#2B2B2B]/60">Eiwitten (g)</p>
                <p className="text-lg font-semibold text-[#2196F3]">
                  {product.nutrition.proteins ? product.nutrition.proteins.toFixed(1) : '-'}
                </p>
              </div>
              <div>
                <p className="text-xs text-[#2B2B2B]/60">Vet (g)</p>
                <p className="text-lg font-semibold text-[#FF9800]">
                  {product.nutrition.fat ? Math.round(product.nutrition.fat) : '-'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Quantity Selector */}
        <div className="mb-4 rounded-xl bg-[#E5E5E0] p-3">
          <QuantitySelector
            productQuantity={product.quantity}
            multiplier={multiplier}
            quantityPerItem={quantityPerItem}
            onMultiplierChange={setMultiplier}
            onQuantityPerItemChange={setQuantityPerItem}
          />
        </div>

        {/* Expiry Date Selector */}
        <div className="mb-4 rounded-xl bg-[#E5E5E0] p-3">
          <ExpiryDateSelector
            day={expiryDay}
            month={expiryMonth}
            year={expiryYear}
            onDayChange={setExpiryDay}
            onMonthChange={setExpiryMonth}
            onYearChange={setExpiryYear}
          />
        </div>

        {/* Add Product Button */}
        <button
          onClick={handleAddProduct}
          disabled={isAdding}
          className="w-full rounded-xl bg-[#1F6F54] px-6 py-3 text-base font-semibold text-white transition-colors hover:bg-[#1a5d47] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isAdding ? 'Product toevoegen...' : '+ Product toevoegen'}
        </button>

        {error && (
          <div className="mt-4 rounded-lg bg-red-100 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}
