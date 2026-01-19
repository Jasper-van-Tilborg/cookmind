'use client';

import { useState, useEffect } from 'react';

interface QuantitySelectorProps {
  productQuantity: string | null; // e.g., "1kg", "500g", "250g"
  multiplier: number;
  quantityPerItem: string;
  onMultiplierChange: (multiplier: number) => void;
  onQuantityPerItemChange: (quantity: string) => void;
}

export default function QuantitySelector({
  productQuantity,
  multiplier,
  quantityPerItem,
  onMultiplierChange,
  onQuantityPerItemChange,
}: QuantitySelectorProps) {
  const [quantityOptions, setQuantityOptions] = useState<string[]>([]);

  // Parse quantity options from product quantity or use defaults
  useEffect(() => {
    if (productQuantity) {
      // Try to extract quantity from product quantity string (e.g., "1kg", "500g")
      const match = productQuantity.match(/(\d+)\s*(g|kg|ml|l|stuks?)/i);
      if (match) {
        const value = parseInt(match[1]);
        const unit = match[2].toLowerCase();
        
        // Generate options based on the product quantity
        const options: string[] = [];
        
        if (unit === 'g' || unit === 'kg') {
          // For weight: 250g, 500g, 1kg, etc.
          if (value >= 1000) {
            // If product is in kg, offer kg options
            options.push('1kg', '500g', '250g');
          } else {
            // If product is in g, offer g options
            const baseValue = value;
            if (baseValue >= 500) {
              options.push(`${baseValue}g`, `${baseValue / 2}g`, `${baseValue / 4}g`);
            } else if (baseValue >= 250) {
              options.push(`${baseValue}g`, `${baseValue / 2}g`, '125g');
            } else {
              options.push(`${baseValue}g`, `${baseValue * 2}g`, `${baseValue * 4}g`);
            }
          }
        } else if (unit === 'ml' || unit === 'l') {
          // For volume: 250ml, 500ml, 1l, etc.
          if (value >= 1000) {
            options.push('1l', '500ml', '250ml');
          } else {
            const baseValue = value;
            if (baseValue >= 500) {
              options.push(`${baseValue}ml`, `${baseValue / 2}ml`, `${baseValue / 4}ml`);
            } else if (baseValue >= 250) {
              options.push(`${baseValue}ml`, `${baseValue / 2}ml`, '125ml');
            } else {
              options.push(`${baseValue}ml`, `${baseValue * 2}ml`, `${baseValue * 4}ml`);
            }
          }
        } else {
          // For pieces (stuks)
          options.push('1 stuks', '2 stuks', '3 stuks', '4 stuks', '5 stuks');
        }
        
        // Remove duplicates and sort
        const uniqueOptions = Array.from(new Set(options)).filter(Boolean);
        setQuantityOptions(uniqueOptions.length > 0 ? uniqueOptions : ['1 stuks']);
      } else {
        // Default options if parsing fails
        setQuantityOptions(['1 stuks', '250g', '500g', '1kg']);
      }
    } else {
      // Default options if no product quantity
      setQuantityOptions(['1 stuks', '250g', '500g', '1kg']);
    }
  }, [productQuantity]);

  // Set initial quantity per item if not set
  useEffect(() => {
    if (!quantityPerItem && quantityOptions.length > 0) {
      onQuantityPerItemChange(quantityOptions[0]);
    }
  }, [quantityOptions, quantityPerItem, onQuantityPerItemChange]);

  return (
    <div className="flex gap-2">
      {/* Multiplier selector - smaller */}
      <div className="w-20 shrink-0">
        <label className="mb-1 block text-xs font-medium text-[#2B2B2B]">
          1x
        </label>
        <div className="flex items-center gap-1">
          <button
            onClick={() => onMultiplierChange(Math.max(1, multiplier - 1))}
            className="flex h-10 w-8 items-center justify-center rounded-lg border border-[#E5E5E0] bg-white text-[#2B2B2B] transition-colors hover:bg-[#E5E5E0]"
            aria-label="Verminder"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M5 12H19"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          <input
            type="number"
            min="1"
            value={multiplier}
            onChange={(e) => {
              const value = parseInt(e.target.value) || 1;
              onMultiplierChange(Math.max(1, value));
            }}
            className="h-10 w-full rounded-lg border border-[#E5E5E0] bg-white px-1 text-center text-sm font-semibold text-[#2B2B2B] focus:border-[#1F6F54] focus:outline-none"
          />
          <button
            onClick={() => onMultiplierChange(multiplier + 1)}
            className="flex h-10 w-8 items-center justify-center rounded-lg border border-[#E5E5E0] bg-white text-[#2B2B2B] transition-colors hover:bg-[#E5E5E0]"
            aria-label="Verhoog"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12 5V19M5 12H19"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Quantity per item selector - larger */}
      <div className="flex-1">
        <label className="mb-1 block text-sm font-medium text-[#2B2B2B]">
          Per stuk
        </label>
        <select
          value={quantityPerItem}
          onChange={(e) => onQuantityPerItemChange(e.target.value)}
          className="h-10 w-full rounded-lg border border-[#E5E5E0] bg-white px-4 text-sm text-[#2B2B2B] focus:border-[#1F6F54] focus:outline-none"
        >
          {quantityOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
