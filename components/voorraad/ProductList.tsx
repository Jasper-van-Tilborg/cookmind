'use client';

import { useState, useMemo } from 'react';
import ProductCard, { InventoryItem } from './ProductCard';

interface ProductListProps {
  items: InventoryItem[];
  onEdit: (item: InventoryItem) => void;
  onDelete: (itemId: string) => void;
  searchQuery: string;
  sortBy: 'name' | 'date' | 'quantity';
}

export default function ProductList({
  items,
  onEdit,
  onDelete,
  searchQuery,
  sortBy,
}: ProductListProps) {
  const filteredAndSortedItems = useMemo(() => {
    let filtered = items;

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter((item) =>
        item.product_name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Sort
    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.product_name.localeCompare(b.product_name);
        case 'quantity':
          return b.quantity - a.quantity;
        case 'date':
        default:
          // Assuming items have created_at, for now just return as is
          return 0;
      }
    });

    return sorted;
  }, [items, searchQuery, sortBy]);

  if (filteredAndSortedItems.length === 0) {
    return (
      <div className="px-6 py-8 text-center">
        <p className="text-[#2B2B2B]/60">
          {searchQuery ? 'Geen producten gevonden' : 'Geen producten in voorraad'}
        </p>
      </div>
    );
  }

  return (
    <div className="px-6 pb-24">
      {filteredAndSortedItems.map((item) => (
        <ProductCard
          key={item.id}
          item={item}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
