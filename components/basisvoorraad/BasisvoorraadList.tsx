'use client';

import BasisvoorraadItem from './BasisvoorraadItem';

export interface BasisvoorraadProduct {
  id: string;
  name: string;
}

interface BasisvoorraadListProps {
  products: BasisvoorraadProduct[];
  selectedIds: Set<string>;
  onToggle: (id: string) => void;
}

export default function BasisvoorraadList({
  products,
  selectedIds,
  onToggle,
}: BasisvoorraadListProps) {
  // Split products into two columns
  const leftColumn = products.filter((_, index) => index % 2 === 0);
  const rightColumn = products.filter((_, index) => index % 2 === 1);

  return (
    <div className="grid grid-cols-2 gap-4 px-6">
      {/* Left column */}
      <div className="space-y-2">
        {leftColumn.map((product) => (
          <BasisvoorraadItem
            key={product.id}
            id={product.id}
            name={product.name}
            isSelected={selectedIds.has(product.id)}
            onToggle={onToggle}
          />
        ))}
      </div>

      {/* Right column */}
      <div className="space-y-2">
        {rightColumn.map((product) => (
          <BasisvoorraadItem
            key={product.id}
            id={product.id}
            name={product.name}
            isSelected={selectedIds.has(product.id)}
            onToggle={onToggle}
          />
        ))}
      </div>
    </div>
  );
}
