'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';
import VoorraadHeader from '@/components/voorraad/VoorraadHeader';
import BasisvoorraadIntro from '@/components/basisvoorraad/BasisvoorraadIntro';
import BasisvoorraadSearch from '@/components/basisvoorraad/BasisvoorraadSearch';
import BasisvoorraadList, {
  BasisvoorraadProduct,
} from '@/components/basisvoorraad/BasisvoorraadList';
import BottomNav from '@/components/navigation/BottomNav';

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
}

export default function BasisvoorraadModal({
  isOpen,
  onClose,
  initialSelectedIds = new Set(),
  onSelectionChange,
}: BasisvoorraadModalProps) {
  const supabase = createClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(initialSelectedIds);
  const [isSaving, setIsSaving] = useState(false);

  // Update selectedIds when initialSelectedIds changes
  useEffect(() => {
    setSelectedIds(new Set(initialSelectedIds));
  }, [initialSelectedIds]);

  // Save selection to database
  const saveSelection = async (productId: string, isSelected: boolean) => {
    try {
      setIsSaving(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      if (isSelected) {
        // Insert
        const { error } = await supabase.from('basic_inventory').insert({
          user_id: user.id,
          product_id: productId,
        });

        if (error) {
          const errorCode = error?.code;
          const errorMessage = error?.message || '';
          // Check for duplicate key errors (23505) and relation does not exist (42P01)
          const isDuplicateError = errorCode === '23505' || errorMessage.toLowerCase().includes('duplicate');
          const isRelationError = 
            errorCode === '42P01' || 
            errorMessage.toLowerCase().includes('does not exist') ||
            errorMessage.toLowerCase().includes('relation') ||
            errorMessage.toLowerCase().includes('table');
          
          // Only log if it's a real error, not duplicate or missing table
          if (!isDuplicateError && !isRelationError && errorMessage) {
            console.error('Error saving basic inventory:', {
              code: errorCode,
              message: errorMessage,
              details: error?.details,
              hint: error?.hint,
            });
          }
        }
      } else {
        // Delete
        const { error } = await supabase
          .from('basic_inventory')
          .delete()
          .eq('user_id', user.id)
          .eq('product_id', productId);

        if (error) {
          const errorCode = error?.code;
          const errorMessage = error?.message || '';
          // Check if it's a "relation does not exist" error (table not created yet)
          const isRelationError = 
            errorCode === '42P01' || 
            errorMessage.toLowerCase().includes('does not exist') ||
            errorMessage.toLowerCase().includes('relation') ||
            errorMessage.toLowerCase().includes('table');
          
          // Only log if it's a real error, not missing table
          if (!isRelationError && errorMessage) {
            console.error('Error deleting basic inventory:', {
              code: errorCode,
              message: errorMessage,
              details: error?.details,
              hint: error?.hint,
            });
          }
        }
      }
    } catch (error) {
      // Only log unexpected errors
      if (error instanceof Error) {
        console.error('Unexpected error saving basic inventory:', error.message);
      } else {
        console.error('Unexpected error saving basic inventory:', error);
      }
    } finally {
      setIsSaving(false);
    }
  };

  // Handle checkbox toggle
  const handleToggle = async (productId: string) => {
    const newSelectedIds = new Set(selectedIds);
    const isSelected = selectedIds.has(productId);

    if (isSelected) {
      newSelectedIds.delete(productId);
    } else {
      newSelectedIds.add(productId);
    }

    // Optimistic update
    setSelectedIds(newSelectedIds);
    
    // Notify parent of change
    if (onSelectionChange) {
      onSelectionChange(newSelectedIds);
    }

    // Save to database
    await saveSelection(productId, !isSelected);
  };

  // Filter products based on search query
  const filteredProducts = STANDARD_PRODUCTS.filter((product) =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handle header button clicks
  const handleBarcodeClick = () => {
    // TODO: Implement barcode scanner
    console.log('Barcode scanner clicked');
  };

  const handlePlusClick = () => {
    // TODO: Implement add product manually
    console.log('Add product manually clicked');
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
            className="flex-1 overflow-y-auto pb-20"
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

          {/* Bottom Navigation - Sticky, no animation */}
          <div className="sticky bottom-0 z-10 bg-[#FAFAF7]">
            <BottomNav />
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}
