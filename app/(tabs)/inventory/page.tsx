'use client';

import { useState, useEffect } from 'react';
import { Plus, Package, ScanLine } from 'lucide-react';
import InventoryItem from '@/src/components/inventory/InventoryItem';
import ProductSearchModal from '@/src/components/inventory/ProductSearchModal';
import BasicInventoryModal from '@/src/components/inventory/BasicInventoryModal';
import InventoryCTA from '@/src/components/inventory/InventoryCTA';
import BarcodeScanner from '@/src/components/inventory/BarcodeScanner';
import { InventoryItem as InventoryItemType } from '@/src/types';
import { storage } from '@/src/lib/storage';
import { useAuth } from '@/src/contexts/AuthContext';

export default function InventoryPage() {
  const [items, setItems] = useState<InventoryItemType[]>([]);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isBasicInventoryModalOpen, setIsBasicInventoryModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  // Load from Supabase on mount
  useEffect(() => {
    async function loadInventory() {
      setIsLoading(true);
      try {
        const userId = user?.id;
        const savedInventory = await storage.getInventory(userId);
        setItems(savedInventory);
      } catch (error) {
        console.error('Error loading inventory:', error);
        // Bij error, gewoon lege lijst tonen
        setItems([]);
      } finally {
        setIsLoading(false);
      }
    }
    if (user) {
      loadInventory();
    }
  }, [user]);


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

  const handleBasicInventoryAdded = (addedItems: InventoryItemType[]) => {
    setItems([...items, ...addedItems]);
  };


  return (
    <div className="p-4 pb-20 max-w-md mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Voorraad</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setIsScannerOpen(true)}
            className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            aria-label="Barcode scannen"
          >
            <ScanLine size={24} />
          </button>
          <button
            onClick={() => setIsSearchModalOpen(true)}
            className="p-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            aria-label="Product zoeken"
          >
            <Plus size={24} />
          </button>
        </div>
      </div>

      {/* CTA Card */}
      {items.length > 0 && (
        <div className="mb-6">
          <InventoryCTA itemCount={items.length} />
        </div>
      )}

      {/* Basisvoorraad knop */}
      <div className="mb-6">
        <button
          onClick={() => setIsBasicInventoryModalOpen(true)}
          className="w-full flex items-center justify-center gap-2 bg-blue-500 text-white py-3 px-4 rounded-lg hover:bg-blue-600 transition-colors font-medium touch-target"
        >
          <Package size={20} />
          Basisvoorraad toevoegen
        </button>
      </div>

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

      <ProductSearchModal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
      />

      <BarcodeScanner
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
      />

      <BasicInventoryModal
        isOpen={isBasicInventoryModalOpen}
        onClose={() => setIsBasicInventoryModalOpen(false)}
        onItemsAdded={handleBasicInventoryAdded}
      />
    </div>
  );
}
