'use client';

import Image from 'next/image';

export interface AddProductItemData {
  barcode: string | null;
  name: string;
  image: string | null;
  brand: string | null;
  quantity: string | null;
  categories?: string[];
  suggestedTag?: string | null;
}

interface AddProductItemProps {
  product: AddProductItemData;
  onClick: () => void;
}

export default function AddProductItem({
  product,
  onClick,
}: AddProductItemProps) {
  return (
    <button
      onClick={onClick}
      className="mb-3 flex w-full items-center gap-4 rounded-xl bg-[#E5E5E0] p-4 text-left transition-colors hover:bg-[#D5D5D0]"
    >
      {/* Product Image */}
      <div className="flex-shrink-0">
        {product.image ? (
          <Image
            src={product.image}
            alt={product.name}
            width={60}
            height={60}
            className="rounded-lg object-cover"
          />
        ) : (
          <div className="flex h-[60px] w-[60px] items-center justify-center rounded-lg bg-[#9FC5B5]">
            <svg
              className="h-8 w-8 text-[#1F6F54]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
              />
            </svg>
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="flex min-w-0 flex-1 flex-col">
        <h3 className="mb-1 truncate text-base font-semibold text-[#2B2B2B]">
          {product.name}
        </h3>
        <div className="flex items-center gap-2 overflow-hidden">
          {product.brand && (
            <>
              <span className="flex-shrink-0 text-sm text-[#2B2B2B]/80">
                {product.brand}
              </span>
              {product.quantity && (
                <>
                  <span className="flex-shrink-0 text-sm text-[#2B2B2B]/60">•</span>
                  <span className="truncate text-sm text-[#2B2B2B]/80">
                    {product.quantity}
                  </span>
                </>
              )}
            </>
          )}
          {!product.brand && product.quantity && (
            <span className="truncate text-sm text-[#2B2B2B]/80">
              {product.quantity}
            </span>
          )}
        </div>
        {product.suggestedTag && (
          <div className="mt-2">
            <span className="inline-block rounded-full bg-[#D6EDE2] px-2 py-1 text-xs font-medium text-[#1F6F54]">
              {product.suggestedTag}
            </span>
          </div>
        )}
      </div>
    </button>
  );
}
