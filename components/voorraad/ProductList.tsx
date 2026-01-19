'use client';

import { useState, useMemo } from 'react';
import ProductCard, { InventoryItem } from './ProductCard';

interface ProductListProps {
  items: InventoryItem[];
  onEdit: (item: InventoryItem) => void;
  onDelete: (itemId: string) => void;
  searchQuery: string;
  sortBy: 'name' | 'date' | 'quantity' | 'expiry';
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
        case 'expiry':
          // Sort by expiry date: items without expiry date go to bottom
          // Items with expiry date sorted ascending (earliest first)
          if (!a.expiry_date && !b.expiry_date) return 0;
          if (!a.expiry_date) return 1; // a goes to bottom
          if (!b.expiry_date) return -1; // b goes to bottom
          return a.expiry_date.localeCompare(b.expiry_date);
        case 'date':
        default:
          // Sort by created_at descending (newest first)
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
