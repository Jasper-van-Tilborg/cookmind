'use client';

import { useState, useMemo } from 'react';
import Image from 'next/image';
import { ArrowLeft, Plus, Minus } from 'lucide-react';
import { BarcodeProduct, NutritionFacts } from '@/src/lib/barcode';
import { calculateNutritionForQuantity } from '@/src/lib/nutrition';

interface ProductDetailProps {
  product: BarcodeProduct;
  onAdd: (quantity: number, unit: string) => void;
  onCancel: () => void;
}

export default function ProductDetail({ product, onAdd, onCancel }: ProductDetailProps) {
  const [quantity, setQuantity] = useState(product.servingSize || 1);
  const [unit, setUnit] = useState(product.servingUnit || 'stuk');

  const commonUnits = ['stuk', 'g', 'kg', 'ml', 'l', 'fles', 'pak', 'doos'];

  const handleQuantityChange = (delta: number) => {
    const newQuantity = Math.max(0.1, quantity + delta);
    setQuantity(Math.round(newQuantity * 10) / 10);
  };

  const handleAdd = () => {
    onAdd(quantity, unit);
  };

  // Bereken voedingswaarden voor geselecteerde hoeveelheid
  const calculatedNutrition = useMemo(() => {
    if (!product.nutritionFacts) return undefined;
    
    // Converteer quantity naar gram voor berekening
    // Open Food Facts voedingswaarden zijn altijd per 100g
    let quantityInGrams = quantity;
    
    if (unit === 'kg') {
      quantityInGrams = quantity * 1000; // kg naar gram
    } else if (unit === 'g') {
      quantityInGrams = quantity; // al in gram
    } else if (unit === 'ml' || unit === 'l') {
      // Voor vloeistoffen: 1ml ≈ 1g (water-based), maar dit is een vereenvoudiging
      quantityInGrams = unit === 'l' ? quantity * 1000 : quantity;
    } else {
      // Voor "stuk", "fles", "pak", "doos" etc. gebruiken we servingSize als referentie
      // Als er een servingSize is, gebruiken we die als basis
      if (product.servingSize && product.servingUnit) {
        // Probeer servingSize te converteren naar gram
        const servingInGrams = product.servingUnit === 'g' ? product.servingSize :
                              product.servingUnit === 'kg' ? product.servingSize * 1000 :
                              product.servingSize; // fallback
        quantityInGrams = (quantity / product.servingSize) * servingInGrams;
      } else {
        // Geen serving size beschikbaar, gebruik quantity direct (vereenvoudiging)
        quantityInGrams = quantity;
      }
    }

    return calculateNutritionForQuantity(product.nutritionFacts, quantityInGrams, 100);
  }, [product.nutritionFacts, product.servingSize, product.servingUnit, quantity, unit]);

  const nutrition = calculatedNutrition || product.nutritionFacts;

  return (
    <div className="min-h-screen bg-gray-50 safe-area-inset">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10 safe-area-top">
        <div className="flex items-center justify-between p-4">
          <button
            onClick={onCancel}
            className="p-2 active:bg-gray-100 rounded-lg transition-colors touch-target"
            aria-label="Terug"
          >
            <ArrowLeft size={22} />
          </button>
          <h1 className="text-lg font-semibold text-gray-800">Product Details</h1>
          <div className="w-10" /> {/* Spacer */}
        </div>
      </div>

      <div className="pb-24">
        {/* Product Image */}
        <div className="relative w-full h-64 bg-gray-200">
          {product.imageUrl ? (
            <Image
              src={product.imageUrl}
              alt={product.name}
              fill
              className="object-cover"
              unoptimized
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              Geen afbeelding beschikbaar
            </div>
          )}
        </div>

        <div className="p-4 space-y-6">
          {/* Product Info */}
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-1">{product.name}</h2>
            {product.brand && (
              <p className="text-sm text-gray-600">{product.brand}</p>
            )}
            <p className="text-xs text-gray-500 mt-1">{product.category}</p>
          </div>

          {/* Macronutriënten */}
          {nutrition && (
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Voedingswaarden</h3>
              <p className="text-xs text-gray-500 mb-3">
                Per {quantity} {unit}
              </p>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
                  <div className="text-2xl font-bold text-green-700">
                    {nutrition.calories !== undefined ? Math.round(nutrition.calories) : '-'}
                  </div>
                  <div className="text-xs text-green-600 font-medium">Calories</div>
                </div>
                <div className="bg-pink-50 border-2 border-pink-200 rounded-lg p-4">
                  <div className="text-2xl font-bold text-pink-700">
                    {nutrition.carbs !== undefined ? nutrition.carbs.toFixed(1) : '-'}
                  </div>
                  <div className="text-xs text-pink-600 font-medium">Carbs (g)</div>
                </div>
                <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
                  <div className="text-2xl font-bold text-blue-700">
                    {nutrition.protein !== undefined ? nutrition.protein.toFixed(1) : '-'}
                  </div>
                  <div className="text-xs text-blue-600 font-medium">Protein (g)</div>
                </div>
                <div className="bg-orange-50 border-2 border-orange-200 rounded-lg p-4">
                  <div className="text-2xl font-bold text-orange-700">
                    {nutrition.fat !== undefined ? nutrition.fat.toFixed(1) : '-'}
                  </div>
                  <div className="text-xs text-orange-600 font-medium">Fat (g)</div>
                </div>
              </div>
            </div>
          )}

          {/* Hoeveelheid Selector */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Hoeveelheid</h3>
            <div className="bg-white border-2 border-gray-200 rounded-lg p-4 space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">Aantal</label>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleQuantityChange(-0.5)}
                    className="p-2 bg-gray-100 active:bg-gray-200 rounded-lg touch-target"
                    aria-label="Verminder"
                  >
                    <Minus size={18} />
                  </button>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(0.1, parseFloat(e.target.value) || 0.1))}
                    className="w-20 text-center text-lg font-semibold border-2 border-gray-300 rounded-lg px-2 py-1 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    min="0.1"
                    step="0.1"
                  />
                  <button
                    onClick={() => handleQuantityChange(0.5)}
                    className="p-2 bg-gray-100 active:bg-gray-200 rounded-lg touch-target"
                    aria-label="Verhoog"
                  >
                    <Plus size={18} />
                  </button>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Eenheid</label>
                <select
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  className="w-full p-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-base"
                >
                  {commonUnits.map((u) => (
                    <option key={u} value={u}>
                      {u}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Uitgebreide Voedingswaarden */}
          {nutrition && (
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Uitgebreide voedingswaarden</h3>
              <p className="text-xs text-gray-500 mb-3">
                Per {quantity} {unit}
              </p>
              <div className="bg-white border-2 border-gray-200 rounded-lg p-4">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  {nutrition.fiber !== undefined && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Vezels:</span>
                      <span className="font-medium text-gray-800">{nutrition.fiber.toFixed(1)} g</span>
                    </div>
                  )}
                  {nutrition.sugar !== undefined && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Suikers:</span>
                      <span className="font-medium text-gray-800">{nutrition.sugar.toFixed(1)} g</span>
                    </div>
                  )}
                  {nutrition.sodium !== undefined && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Natrium:</span>
                      <span className="font-medium text-gray-800">{nutrition.sodium !== undefined ? Math.round(nutrition.sodium) : '-'} mg</span>
                    </div>
                  )}
                  {nutrition.calcium !== undefined && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Calcium:</span>
                      <span className="font-medium text-gray-800">{nutrition.calcium !== undefined ? Math.round(nutrition.calcium) : '-'} mg</span>
                    </div>
                  )}
                  {nutrition.iron !== undefined && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Ijzer:</span>
                      <span className="font-medium text-gray-800">{nutrition.iron !== undefined ? Math.round(nutrition.iron) : '-'} mg</span>
                    </div>
                  )}
                  {nutrition.magnesium !== undefined && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Magnesium:</span>
                      <span className="font-medium text-gray-800">{nutrition.magnesium !== undefined ? Math.round(nutrition.magnesium) : '-'} mg</span>
                    </div>
                  )}
                  {nutrition.potassium !== undefined && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Kalium:</span>
                      <span className="font-medium text-gray-800">{nutrition.potassium !== undefined ? Math.round(nutrition.potassium) : '-'} mg</span>
                    </div>
                  )}
                  {nutrition.zinc !== undefined && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Zink:</span>
                      <span className="font-medium text-gray-800">{nutrition.zinc !== undefined ? Math.round(nutrition.zinc) : '-'} mg</span>
                    </div>
                  )}
                  {nutrition.phosphorus !== undefined && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Fosfor:</span>
                      <span className="font-medium text-gray-800">{nutrition.phosphorus !== undefined ? Math.round(nutrition.phosphorus) : '-'} mg</span>
                    </div>
                  )}
                  {nutrition.copper !== undefined && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Koper:</span>
                      <span className="font-medium text-gray-800">{nutrition.copper !== undefined ? Math.round(nutrition.copper) : '-'} mg</span>
                    </div>
                  )}
                  {nutrition.selenium !== undefined && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Selenium:</span>
                      <span className="font-medium text-gray-800">{nutrition.selenium !== undefined ? Math.round(nutrition.selenium) : '-'} mcg</span>
                    </div>
                  )}
                  {nutrition.vitaminC !== undefined && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Vitamine C:</span>
                      <span className="font-medium text-gray-800">{nutrition.vitaminC !== undefined ? Math.round(nutrition.vitaminC) : '-'} mg</span>
                    </div>
                  )}
                </div>
                {!nutrition.fiber && !nutrition.sugar && !nutrition.sodium && (
                  <p className="text-sm text-gray-500 text-center mt-4">
                    Uitgebreide voedingswaarden niet beschikbaar
                  </p>
                )}
              </div>
            </div>
          )}

          {!nutrition && (
            <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-yellow-700 text-center">
                Voedingswaarden niet beschikbaar voor dit product
              </p>
            </div>
          )}

          {/* Action Buttons - Sticky bottom on mobile */}
          <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-4 safe-area-bottom shadow-lg z-10">
            <div className="flex gap-3 max-w-md mx-auto">
              <button
                onClick={onCancel}
                className="flex-1 py-3 px-4 border-2 border-gray-300 rounded-lg text-gray-700 active:bg-gray-50 transition-colors touch-target text-base font-medium"
              >
                Annuleren
              </button>
              <button
                onClick={handleAdd}
                className="flex-1 py-3 px-4 bg-purple-600 text-white rounded-lg active:bg-purple-700 transition-colors touch-target text-base font-medium"
              >
                Toevoegen aan voorraad
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

