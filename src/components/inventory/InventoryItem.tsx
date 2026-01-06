'use client';

import { Trash2 } from 'lucide-react';
import { InventoryItem as InventoryItemType } from '@/src/types';

interface InventoryItemProps {
  item: InventoryItemType;
  onDelete?: () => void;
}

export default function InventoryItem({ item, onDelete }: InventoryItemProps) {
  return (
    <div className="bg-white rounded-lg p-4 shadow-sm flex items-center justify-between">
      <div className="flex-1">
        <h3 className="font-medium text-gray-800">{item.name}</h3>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-sm text-gray-600">
            {item.quantity} {item.unit || 'stuk'}
          </span>
          <span className="text-xs text-gray-400">•</span>
          <span className="text-xs text-gray-500">{item.category}</span>
        </div>
      </div>
      {onDelete && (
        <button
          onClick={onDelete}
          className="ml-4 p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
          aria-label="Verwijder item"
        >
          <Trash2 size={20} />
        </button>
      )}
    </div>
  );
}



