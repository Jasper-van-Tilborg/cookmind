'use client';

import AddProductItem, { AddProductItemData } from './AddProductItem';

interface AddProductListProps {
  products: AddProductItemData[];
  onProductClick: (product: AddProductItemData) => void;
  isLoading?: boolean;
  showHeader?: boolean;
}

export default function AddProductList({
  products,
  onProductClick,
  isLoading = false,
  showHeader = false,
}: AddProductListProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center px-6 py-12">
        <div className="text-center">
          <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-[#1F6F54] border-t-transparent mx-auto"></div>
          <p className="text-[#2B2B2B]">Producten laden...</p>
        </div>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="flex items-center justify-center px-6 py-12">
        <p className="text-[#2B2B2B]/60">Geen producten gevonden</p>
      </div>
    );
  }

  return (
    <div className="px-6">
      {showHeader && (
        <h3 className="mb-4 text-lg font-semibold text-[#2B2B2B]">
          Recent toegevoegd
        </h3>
      )}
      {products.map((product, index) => (
        <AddProductItem
          key={`${product.barcode || 'no-barcode'}-${product.name}-${index}`}
          product={product}
          onClick={() => onProductClick(product)}
        />
      ))}
    </div>
  );
}
