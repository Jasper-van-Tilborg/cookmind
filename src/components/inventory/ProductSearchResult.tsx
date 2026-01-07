'use client';

import Image from 'next/image';
import { Package } from 'lucide-react';
import { BarcodeProduct } from '@/src/lib/barcode';

interface ProductSearchResultProps {
  product: BarcodeProduct;
  onClick: () => void;
}

export default function ProductSearchResult({ product, onClick }: ProductSearchResultProps) {
  const calories = product.nutritionFacts?.calories;
  const servingInfo = product.servingSize && product.servingUnit 
    ? `${product.servingSize} ${product.servingUnit}`
    : product.servingUnit || 'Portie';

  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200 hover:border-purple-300 hover:bg-purple-50 transition-colors text-left touch-target"
    >
      {/* Product Image */}
      <div className="flex-shrink-0 w-16 h-16 bg-gray-100 rounded-lg overflow-hidden">
        {product.imageUrl ? (
          <Image
            src={product.imageUrl}
            alt={product.name}
            width={64}
            height={64}
            className="w-full h-full object-cover"
            unoptimized
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <Package size={24} />
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="flex-1 min-w-0">
        <h3 className="font-medium text-gray-800 mb-1 line-clamp-2">
          {product.name}
        </h3>
        {product.brand && (
          <p className="text-xs text-gray-500 mb-1">{product.brand}</p>
        )}
        <div className="flex items-center gap-3 text-xs text-gray-600">
          {calories !== undefined && (
            <span className="font-medium text-green-600">{calories} kcal</span>
          )}
          <span>{servingInfo}</span>
        </div>
      </div>
    </button>
  );
}

