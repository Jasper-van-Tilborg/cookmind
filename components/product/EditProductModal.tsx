'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';
import IngredientTagSelector from './IngredientTagSelector';
import { InventoryItem } from '@/components/voorraad/ProductCard';
import { suggestIngredientTag } from '@/lib/utils/productTagging';

interface EditProductModalProps {
  isOpen: boolean;
  item: InventoryItem | null;
  onClose: () => void;
  onUpdated?: () => void;
}

export default function EditProductModal({
  isOpen,
  item,
  onClose,
  onUpdated,
}: EditProductModalProps) {
  const supabase = createClient();
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [suggestedTag, setSuggestedTag] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Update selected tag when item changes
  useEffect(() => {
    if (item) {
      setSelectedTag(item.ingredient_tag || null);
      // Get suggested tag if no tag exists
      if (!item.ingredient_tag) {
        const suggestion = suggestIngredientTag(item.product_name, null);
        setSuggestedTag(suggestion);
      } else {
        setSuggestedTag(null);
      }
    }
  }, [item]);

  const handleTagSelected = async (tag: string | null) => {
    if (!item) return;

    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.error('User not logged in');
        setIsLoading(false);
        return;
      }

      // Update inventory item with new tag
      const updateData: any = {
        ingredient_tag: tag,
      };

      const { error } = await supabase
        .from('inventory')
        .update(updateData)
        .eq('id', item.id)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error updating product tag:', error);
        setIsLoading(false);
        return;
      }

      // Notify parent
      if (onUpdated) {
        onUpdated();
      }

      // Close modal
      onClose();
    } catch (error) {
      console.error('Error updating product:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen || !item) return null;

  return (
    <AnimatePresence>
      {isOpen && item && (
        <IngredientTagSelector
          suggestedTag={suggestedTag}
          value={selectedTag}
          onChange={handleTagSelected}
          onClose={onClose}
        />
      )}
    </AnimatePresence>
  );
}
