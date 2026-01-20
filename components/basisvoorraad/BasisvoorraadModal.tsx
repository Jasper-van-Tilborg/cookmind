'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import VoorraadHeader from '@/components/voorraad/VoorraadHeader';
import BasisvoorraadIntro from '@/components/basisvoorraad/BasisvoorraadIntro';
import BasisvoorraadSearch from '@/components/basisvoorraad/BasisvoorraadSearch';
import BasisvoorraadList, {
  BasisvoorraadProduct,
} from '@/components/basisvoorraad/BasisvoorraadList';

const BASIC_INVENTORY_STORAGE_KEY = 'cookmind_basic_inventory';

// Standard basic inventory products
const STANDARD_PRODUCTS: BasisvoorraadProduct[] = [
  { id: 'bloem', name: 'Bloem' },
  { id: 'suiker', name: 'Suiker' },
  { id: 'azijn', name: 'Azijn' },
  { id: 'sojasaus', name: 'Sojasaus' },
  { id: 'bouillonblokjes', name: 'Bouillonblokjes' },
  { id: 'zout', name: 'Zout' },
  { id: 'peper', name: 'Peper' },
  { id: 'olijfolie', name: 'Olijfolie' },
  { id: 'boter', name: 'Boter' },
  { id: 'mosterd', name: 'Mosterd' },
];

interface BasisvoorraadModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialSelectedIds?: Set<string>;
  onSelectionChange?: (selectedIds: Set<string>) => void;
  onOpenBarcode?: () => void;
  onOpenAddProduct?: () => void;
}

// Helper functions for localStorage
const loadBasicInventoryFromStorage = (): Set<string> => {
  if (typeof window === 'undefined') return new Set();
  try {
    const stored = localStorage.getItem(BASIC_INVENTORY_STORAGE_KEY);
    if (stored) {
      const ids = JSON.parse(stored) as string[];
      return new Set(ids);
    }
  } catch (error) {
    console.error('Error loading basic inventory from localStorage:', error);
  }
  return new Set();
};

const saveBasicInventoryToStorage = (ids: Set<string>): void => {
  if (typeof window === 'undefined') return;
  try {
    const idsArray = Array.from(ids);
    localStorage.setItem(BASIC_INVENTORY_STORAGE_KEY, JSON.stringify(idsArray));
  } catch (error) {
    console.error('Error saving basic inventory to localStorage:', error);
  }
};

export default function BasisvoorraadModal({
  isOpen,
  onClose,
  initialSelectedIds = new Set(),
  onSelectionChange,
  onOpenBarcode,
  onOpenAddProduct,
}: BasisvoorraadModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(initialSelectedIds);

  // Load from localStorage on mount
  useEffect(() => {
    if (isOpen) {
      const storedIds = loadBasicInventoryFromStorage();
      setSelectedIds(storedIds);
      if (onSelectionChange) {
        onSelectionChange(storedIds);
      }
    }
  }, [isOpen, onSelectionChange]);

  // Update selectedIds when initialSelectedIds changes
  useEffect(() => {
    setSelectedIds(new Set(initialSelectedIds));
  }, [initialSelectedIds]);

  // Handle checkbox toggle
  const handleToggle = (productId: string) => {
    const newSelectedIds = new Set(selectedIds);
    const isSelected = selectedIds.has(productId);

    if (isSelected) {
      newSelectedIds.delete(productId);
    } else {
      newSelectedIds.add(productId);
    }

    // Update state
    setSelectedIds(newSelectedIds);
    
    // Save to localStorage
    saveBasicInventoryToStorage(newSelectedIds);
    
    // Notify parent of change
    if (onSelectionChange) {
      onSelectionChange(newSelectedIds);
    }
  };

  // Filter products based on search query
  const filteredProducts = STANDARD_PRODUCTS.filter((product) =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handle header button clicks
  const handleBarcodeClick = () => {
    if (onOpenBarcode) {
      onOpenBarcode();
    } else {
      onClose();
    }
  };

  const handlePlusClick = () => {
    if (onOpenAddProduct) {
      onOpenAddProduct();
    } else {
      // TODO: Implement add product manually
      console.log('Add product manually clicked');
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex flex-col bg-[#FAFAF7]">
          {/* Header - Sticky, no animation */}
          <div className="sticky top-0 z-10 bg-[#FAFAF7]">
            <VoorraadHeader
              onCubeClick={onClose}
              onBarcodeClick={handleBarcodeClick}
              onPlusClick={handlePlusClick}
              onTitleClick={onClose}
              isBasisvoorraadActive={true}
            />
          </div>

          {/* Content - Animated */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="flex-1 overflow-y-auto"
          >
            <BasisvoorraadIntro />
            <BasisvoorraadSearch
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
            />
            <BasisvoorraadList
              products={filteredProducts}
              selectedIds={selectedIds}
              onToggle={handleToggle}
            />
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
