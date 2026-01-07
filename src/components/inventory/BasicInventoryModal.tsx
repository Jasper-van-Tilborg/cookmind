'use client';

import { useState } from 'react';
import { X, Package, Check } from 'lucide-react';
import { BASIC_INVENTORY_ITEMS, BasicInventoryItem, basicInventoryToInventoryItem } from '@/src/lib/basic-inventory';
import { InventoryItem } from '@/src/types';
import { storage } from '@/src/lib/storage';
import { useAuth } from '@/src/contexts/AuthContext';

interface BasicInventoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onItemsAdded?: (items: InventoryItem[]) => void;
}

export default function BasicInventoryModal({
  isOpen,
  onClose,
  onItemsAdded,
}: BasicInventoryModalProps) {
  const { user } = useAuth();
  const [selectedItems, setSelectedItems] = useState<Set<string>>(
    new Set(BASIC_INVENTORY_ITEMS.map(item => item.name))
  );
  const [isAdding, setIsAdding] = useState(false);

  if (!isOpen) return null;

  const handleToggleItem = (itemName: string) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(itemName)) {
      newSelected.delete(itemName);
    } else {
      newSelected.add(itemName);
    }
    setSelectedItems(newSelected);
  };

  const handleSelectAll = () => {
    setSelectedItems(new Set(BASIC_INVENTORY_ITEMS.map(item => item.name)));
  };

  const handleDeselectAll = () => {
    setSelectedItems(new Set());
  };

  const handleAddSelected = async () => {
    if (!user || selectedItems.size === 0) return;

    setIsAdding(true);
    try {
      const itemsToAdd = BASIC_INVENTORY_ITEMS.filter(item =>
        selectedItems.has(item.name)
      );

      const addedItems: InventoryItem[] = [];
      for (const item of itemsToAdd) {
        const inventoryItem = basicInventoryToInventoryItem(item);
        const added = await storage.addInventoryItem(inventoryItem, user.id);
        addedItems.push(added);
      }

      if (onItemsAdded) {
        onItemsAdded(addedItems);
      }

      // Reset en sluit modal
      setSelectedItems(new Set(BASIC_INVENTORY_ITEMS.map(item => item.name)));
      onClose();
    } catch (error) {
      console.error('Error adding basic inventory:', error);
      alert('Er is een fout opgetreden bij het toevoegen van de basisvoorraad.');
    } finally {
      setIsAdding(false);
    }
  };

  const allSelected = selectedItems.size === BASIC_INVENTORY_ITEMS.length;
  const noneSelected = selectedItems.size === 0;

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center"
      onClick={onClose}
    >
      <div
        className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden safe-area-inset"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center gap-2">
            <Package size={24} className="text-purple-600" />
            <h2 className="text-xl font-bold text-gray-800">Basisvoorraad</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors touch-target"
            aria-label="Sluiten"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          <p className="text-sm text-gray-600 mb-4">
            Selecteer de essentiële items die je standaard in je keuken hebt staan.
          </p>

          {/* Select All / Deselect All */}
          <div className="flex gap-2 mb-4">
            <button
              onClick={handleSelectAll}
              disabled={allSelected}
              className={`px-3 py-1.5 text-sm rounded-lg font-medium transition-colors touch-target ${
                allSelected
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Alles selecteren
            </button>
            <button
              onClick={handleDeselectAll}
              disabled={noneSelected}
              className={`px-3 py-1.5 text-sm rounded-lg font-medium transition-colors touch-target ${
                noneSelected
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Alles deselecteren
            </button>
          </div>

          {/* Items List */}
          <div className="space-y-2">
            {BASIC_INVENTORY_ITEMS.map((item) => {
              const isSelected = selectedItems.has(item.name);
              return (
                <label
                  key={item.name}
                  className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all touch-target ${
                    isSelected
                      ? 'border-purple-600 bg-purple-50'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleToggleItem(item.name)}
                      className="sr-only"
                    />
                    <div
                      className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-all ${
                        isSelected
                          ? 'bg-purple-600 border-purple-600'
                          : 'border-gray-300 bg-white'
                      }`}
                    >
                      {isSelected && (
                        <Check size={16} className="text-white" />
                      )}
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-gray-800">{item.name}</div>
                    <div className="text-sm text-gray-500">
                      {item.category} • {item.quantity}
                      {item.unit ? ` ${item.unit}` : ''}
                    </div>
                  </div>
                </label>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-4 flex gap-3 flex-shrink-0 safe-area-bottom">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors touch-target"
          >
            Annuleren
          </button>
          <button
            onClick={handleAddSelected}
            disabled={noneSelected || isAdding}
            className={`flex-1 px-4 py-3 rounded-lg font-medium transition-colors touch-target ${
              noneSelected || isAdding
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-purple-600 text-white hover:bg-purple-700'
            }`}
          >
            {isAdding ? 'Toevoegen...' : `Toevoegen (${selectedItems.size})`}
          </button>
        </div>
      </div>
    </div>
  );
}

