'use client';

import { useState, useEffect } from 'react';
import { Plus, Package } from 'lucide-react';
import InventoryItem from '@/src/components/inventory/InventoryItem';
import AddItemModal from '@/src/components/inventory/AddItemModal';
import InventoryCTA from '@/src/components/inventory/InventoryCTA';
import { InventoryItem as InventoryItemType } from '@/src/types';
import { mockInventory } from '@/src/lib/data';
import { storage } from '@/src/lib/storage';
import { useAuth } from '@/src/contexts/AuthContext';

export default function InventoryPage() {
  const [items, setItems] = useState<InventoryItemType[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  // Load from Supabase on mount
  useEffect(() => {
    async function loadInventory() {
      setIsLoading(true);
      try {
        const userId = user?.id;
        const savedInventory = await storage.getInventory(userId);
        if (savedInventory.length > 0) {
          setItems(savedInventory);
        } else {
          // Use mock data if no saved data
          setItems(mockInventory);
          await storage.setInventory(mockInventory, userId);
        }
      } catch (error) {
        console.error('Error loading inventory:', error);
        // Fallback to mock data
        setItems(mockInventory);
      } finally {
        setIsLoading(false);
      }
    }
    if (user) {
      loadInventory();
    }
  }, [user]);

  const handleAddItem = async (newItem: Omit<InventoryItemType, 'id'>) => {
    try {
      const addedItem = await storage.addInventoryItem(newItem, user?.id);
      setItems([...items, addedItem]);
    } catch (error) {
      console.error('Error adding item:', error);
      // Fallback: add locally
      const item: InventoryItemType = {
        ...newItem,
        id: Date.now(),
      };
      setItems([...items, item]);
    }
  };

  const handleDeleteItem = async (id: number) => {
    try {
      await storage.deleteInventoryItem(id);
      setItems(items.filter(item => item.id !== id));
    } catch (error) {
      console.error('Error deleting item:', error);
      // Fallback: remove locally
      setItems(items.filter(item => item.id !== id));
    }
  };

  const handleAddBasicInventory = async () => {
    const basicItems: Omit<InventoryItemType, 'id'>[] = [
      { name: 'Tomaat', category: 'Groente', quantity: 4 },
      { name: 'Ui', category: 'Groente', quantity: 2 },
      { name: 'Kipfilet', category: 'Vlees', quantity: 500, unit: 'g' },
      { name: 'Rijst', category: 'Graan', quantity: 1, unit: 'kg' },
      { name: 'Olijfolie', category: 'Vet', quantity: 1, unit: 'fles' },
    ];
    
    try {
      const addedItems: InventoryItemType[] = [];
      for (const item of basicItems) {
        const added = await storage.addInventoryItem(item, user?.id);
        addedItems.push(added);
      }
      setItems([...items, ...addedItems]);
    } catch (error) {
      console.error('Error adding basic inventory:', error);
      // Fallback: add locally
      const itemsWithIds = basicItems.map((item, index) => ({
        ...item,
        id: Date.now() + index,
      }));
      setItems([...items, ...itemsWithIds]);
    }
  };

  return (
    <div className="p-4 pb-6 max-w-md mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Voorraad</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="p-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          aria-label="Item toevoegen"
        >
          <Plus size={24} />
        </button>
      </div>

      {/* CTA Card */}
      {items.length > 0 && (
        <div className="mb-6">
          <InventoryCTA itemCount={items.length} />
        </div>
      )}

      {/* Basisvoorraad knop */}
      {items.length === 0 && (
        <div className="mb-6">
          <button
            onClick={handleAddBasicInventory}
            className="w-full flex items-center justify-center gap-2 bg-blue-500 text-white py-3 px-4 rounded-lg hover:bg-blue-600 transition-colors font-medium"
          >
            <Package size={20} />
            Basisvoorraad toevoegen
          </button>
        </div>
      )}

      {/* Inventory List */}
      {isLoading ? (
        <div className="bg-white rounded-lg p-8 text-center shadow-sm">
          <p className="text-gray-600">Laden...</p>
        </div>
      ) : items.length === 0 ? (
        <div className="bg-white rounded-lg p-8 text-center shadow-sm">
          <Package className="mx-auto text-gray-400 mb-4" size={48} />
          <p className="text-gray-600 mb-2">Je voorraad is leeg</p>
          <p className="text-sm text-gray-500">
            Voeg ingrediënten toe om te beginnen
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <InventoryItem
              key={item.id}
              item={item}
              onDelete={() => handleDeleteItem(item.id)}
            />
          ))}
        </div>
      )}

      <AddItemModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAdd={handleAddItem}
      />
    </div>
  );
}
