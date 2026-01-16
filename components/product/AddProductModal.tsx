'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';
import VoorraadHeader from '@/components/voorraad/VoorraadHeader';
import AddProductSearch from './AddProductSearch';
import AddProductList from './AddProductList';
import IngredientTagSelector from './IngredientTagSelector';
import { AddProductItemData } from './AddProductItem';
import { suggestIngredientTag } from '@/lib/utils/productTagging';

// Standard popular products (fallback when no user history)
const STANDARD_POPULAR_PRODUCTS: AddProductItemData[] = [
  { barcode: null, name: 'Melk', image: null, brand: null, quantity: null },
  { barcode: null, name: 'Brood', image: null, brand: null, quantity: null },
  { barcode: null, name: 'Eieren', image: null, brand: null, quantity: null },
  { barcode: null, name: 'Boter', image: null, brand: null, quantity: null },
  { barcode: null, name: 'Kaas', image: null, brand: null, quantity: null },
  { barcode: null, name: 'Yoghurt', image: null, brand: null, quantity: null },
  { barcode: null, name: 'Tomaten', image: null, brand: null, quantity: null },
  { barcode: null, name: 'Ui', image: null, brand: null, quantity: null },
  { barcode: null, name: 'Knoflook', image: null, brand: null, quantity: null },
  { barcode: null, name: 'Aardappelen', image: null, brand: null, quantity: null },
];

interface AddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProductAdded?: () => void;
  onOpenBarcode?: () => void;
  onOpenBasisvoorraad?: () => void;
}

export default function AddProductModal({
  isOpen,
  onClose,
  onProductAdded,
  onOpenBarcode,
  onOpenBasisvoorraad,
}: AddProductModalProps) {
  const supabase = createClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState<AddProductItemData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [userHistory, setUserHistory] = useState<AddProductItemData[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<AddProductItemData | null>(null);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  // Load user history on mount
  useEffect(() => {
    if (!isOpen) return;

    const loadUserHistory = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Get distinct product names from user's inventory, grouped by frequency
        const { data, error } = await supabase
          .from('inventory')
          .select('product_name, product_image')
          .eq('user_id', user.id);

        if (error) {
          console.error('Error loading user history:', error);
          setUserHistory([]);
          return;
        }

        if (!data || data.length === 0) {
          setUserHistory([]);
          return;
        }

        // Group by product_name and count frequency
        const productMap = new Map<string, { name: string; image: string | null; count: number }>();
        
        data.forEach((item) => {
          const name = item.product_name;
          const existing = productMap.get(name);
          if (existing) {
            existing.count += 1;
            // Prefer items with images
            if (!existing.image && item.product_image) {
              existing.image = item.product_image;
            }
          } else {
            productMap.set(name, {
              name,
              image: item.product_image || null,
              count: 1,
            });
          }
        });

        // Convert to array and sort by frequency
        const historyProducts: AddProductItemData[] = Array.from(productMap.values())
          .sort((a, b) => b.count - a.count)
          .slice(0, 20)
          .map((item) => ({
            barcode: null,
            name: item.name,
            image: item.image,
            brand: null,
            quantity: null,
          }));

        setUserHistory(historyProducts);
      } catch (error) {
        console.error('Error loading user history:', error);
        setUserHistory([]);
      }
    };

    loadUserHistory();
  }, [isOpen, supabase]);

  // Update products based on search query
  useEffect(() => {
    if (!isOpen) return;

    if (searchQuery.trim() === '') {
      // Show user history first, then standard products
      const combinedProducts = [...userHistory, ...STANDARD_POPULAR_PRODUCTS];
      setProducts(combinedProducts);
      setIsLoading(false);
      return;
    }

    // Search via API
    setIsLoading(true);
    const searchProducts = async () => {
      try {
        const response = await fetch(`/api/openfoodfacts/search?query=${encodeURIComponent(searchQuery)}`);
        
        if (!response.ok) {
          throw new Error('Failed to search products');
        }

        const data = await response.json();
        
        // Set products immediately without tags for fast initial render
        const productsWithoutTags: AddProductItemData[] = (data.products || []).map((product: any) => ({
          ...product,
          suggestedTag: null, // Will be calculated lazily
        }));
        
        setProducts(productsWithoutTags);
        
        // Calculate tags asynchronously in batches for better performance
        const calculateTagsInBatches = () => {
          const batchSize = 5;
          const totalProducts = productsWithoutTags.length;
          let currentIndex = 0;
          
          const processBatch = () => {
            const endIndex = Math.min(currentIndex + batchSize, totalProducts);
            const batch = productsWithoutTags.slice(currentIndex, endIndex);
            
            const batchWithTags = batch.map((product) => ({
              ...product,
              suggestedTag: suggestIngredientTag(product.name, product.categories),
            }));
            
            // Update products incrementally
            setProducts((prev) => {
              const updated = [...prev];
              batchWithTags.forEach((productWithTag, idx) => {
                updated[currentIndex + idx] = productWithTag;
              });
              return updated;
            });
            
            currentIndex = endIndex;
            
            // Process next batch if there are more products
            if (currentIndex < totalProducts) {
              setTimeout(processBatch, 50);
            }
          };
          
          // Start processing after a short delay
          setTimeout(processBatch, 100);
        };
        
        calculateTagsInBatches();
      } catch (error) {
        console.error('Error searching products:', error);
        setProducts([]);
      } finally {
        setIsLoading(false);
      }
    };

    const debounceTimer = setTimeout(() => {
      searchProducts();
    }, 300);

    return () => {
      clearTimeout(debounceTimer);
      setIsLoading(false);
    };
  }, [searchQuery, isOpen, userHistory]);

  const handleProductClick = (product: AddProductItemData) => {
    // Show tag selector
    setSelectedProduct(product);
    setSelectedTag(product.suggestedTag || null);
  };

  const handleTagSelected = async (tag: string | null) => {
    if (!selectedProduct) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.error('User not logged in');
        setSelectedProduct(null);
        return;
      }

      // Add product to inventory with tag
      const insertData: any = {
        user_id: user.id,
        product_name: selectedProduct.name,
        product_image: selectedProduct.image,
        quantity: 1,
        unit: 'stuks',
        details: selectedProduct.brand
          ? `${selectedProduct.brand}${selectedProduct.quantity ? ` - ${selectedProduct.quantity}` : ''}`
          : selectedProduct.quantity || null,
      };

      // Only add ingredient_tag if it's not null (column might not exist yet)
      if (tag !== null) {
        insertData.ingredient_tag = tag;
      }

      const { error } = await supabase.from('inventory').insert(insertData);

      if (error) {
        // Check if it's a column doesn't exist error
        const errorCode = error?.code;
        const errorMessage = error?.message || '';
        const isColumnError = 
          errorCode === '42703' || 
          errorMessage.toLowerCase().includes('column') ||
          errorMessage.toLowerCase().includes('does not exist');

        if (isColumnError) {
          // Column doesn't exist yet - insert without tag
          const { error: retryError } = await supabase.from('inventory').insert({
            user_id: user.id,
            product_name: selectedProduct.name,
            product_image: selectedProduct.image,
            quantity: 1,
            unit: 'stuks',
            details: selectedProduct.brand
              ? `${selectedProduct.brand}${selectedProduct.quantity ? ` - ${selectedProduct.quantity}` : ''}`
              : selectedProduct.quantity || null,
          });

          if (retryError) {
            console.error('Error adding product to inventory:', retryError);
            setSelectedProduct(null);
            return;
          }
        } else {
          console.error('Error adding product to inventory:', error);
          setSelectedProduct(null);
          return;
        }
      }

      // Notify parent and update user history
      if (onProductAdded) {
        onProductAdded();
      }

      // Add to user history if not already there
      if (!userHistory.some((p) => p.name === selectedProduct.name)) {
        setUserHistory((prev) => [selectedProduct, ...prev].slice(0, 20));
      }

      // Reset search if we were searching
      if (searchQuery.trim() !== '') {
        setSearchQuery('');
      }

      // Close tag selector
      setSelectedProduct(null);
      setSelectedTag(null);
    } catch (error) {
      console.error('Error adding product:', error);
      setSelectedProduct(null);
    }
  };

  const handleCubeClick = () => {
    if (onOpenBasisvoorraad) {
      onClose();
      onOpenBasisvoorraad();
    } else {
      onClose();
    }
  };

  const handleBarcodeClick = () => {
    if (onOpenBarcode) {
      onClose();
      onOpenBarcode();
    } else {
      onClose();
    }
  };

  const handlePlusClick = () => {
    onClose(); // Close current modal
  };

  // Reset search when modal closes
  useEffect(() => {
    if (!isOpen) {
      setSearchQuery('');
      setProducts([]);
    }
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          className="fixed inset-0 z-50 flex flex-col bg-[#FAFAF7]"
        >
          {/* Header - Sticky, no animation */}
          <div className="sticky top-0 z-10 bg-[#FAFAF7]">
            <VoorraadHeader
              onCubeClick={handleCubeClick}
              onBarcodeClick={handleBarcodeClick}
              onPlusClick={handlePlusClick}
              onTitleClick={onClose}
              isPlusActive={true}
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
            <AddProductSearch
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
            />
            <AddProductList
              products={products}
              onProductClick={handleProductClick}
              isLoading={isLoading && searchQuery.trim() !== ''}
            />
          </motion.div>

          {/* Tag Selector Modal */}
          {selectedProduct && (
            <IngredientTagSelector
              suggestedTag={selectedProduct.suggestedTag || null}
              value={selectedTag}
              onChange={handleTagSelected}
              onClose={() => {
                setSelectedProduct(null);
                setSelectedTag(null);
              }}
            />
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
