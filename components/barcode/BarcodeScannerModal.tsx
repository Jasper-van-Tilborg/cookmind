'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';
import VoorraadHeader from '@/components/voorraad/VoorraadHeader';
import ScannerView from './ScannerView';

interface BarcodeScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProductAdded?: () => void;
  onOpenBasisvoorraad?: () => void;
  onOpenAddProduct?: () => void;
}

interface ProductData {
  barcode: string;
  name: string;
  image: string | null;
  brand: string | null;
  quantity: string | null;
}

export default function BarcodeScannerModal({
  isOpen,
  onClose,
  onProductAdded,
  onOpenBasisvoorraad,
  onOpenAddProduct,
}: BarcodeScannerModalProps) {
  const supabase = createClient();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scannerKey, setScannerKey] = useState(0); // Key to force remount of ScannerView

  const handleScanSuccess = async (barcode: string) => {
    setIsProcessing(true);
    setError(null);

    try {
      // Fetch product data from Open Food Facts
      const response = await fetch(`/api/openfoodfacts?barcode=${barcode}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Product niet gevonden');
      }

      const productData: ProductData = await response.json();

      // Get current user
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error('Niet ingelogd');
      }

      // Add product to inventory
      const { error: insertError } = await supabase.from('inventory').insert({
        user_id: user.id,
        product_name: productData.name,
        product_image: productData.image,
        quantity: 1,
        unit: 'stuks',
        details: productData.brand
          ? `${productData.brand}${productData.quantity ? ` - ${productData.quantity}` : ''}`
          : productData.quantity || null,
      });

      if (insertError) {
        throw new Error('Fout bij toevoegen aan voorraad');
      }

      // Success - update inventory and reset scanner
      if (onProductAdded) {
        onProductAdded();
      }
      
      // Reset processing state and remount scanner to allow scanning again
      setIsProcessing(false);
      setError(null);
      // Force remount of ScannerView by changing key
      setScannerKey(prev => prev + 1);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Onbekende fout';
      setError(errorMessage);
      setIsProcessing(false);
    }
  };

  const handleScanError = (errorMessage: string) => {
    // Only show critical errors
    if (errorMessage.includes('Permission denied') || errorMessage.includes('NotAllowedError')) {
      setError('Camera toegang geweigerd');
    }
  };

  const handleCubeClick = () => {
    if (onOpenBasisvoorraad) {
      onOpenBasisvoorraad();
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
        <div className="fixed inset-0 z-50 flex flex-col bg-[#2B2B2B]">
          {/* Header - Sticky, no animation */}
          <div className="sticky top-0 z-10 bg-[#2B2B2B]">
            <VoorraadHeader
              onCubeClick={handleCubeClick}
              onBarcodeClick={onClose}
              onPlusClick={handlePlusClick}
              onTitleClick={onClose}
              isBarcodeActive={true}
            />
          </div>

          {/* Content - Animated */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="relative flex flex-1 flex-col overflow-hidden"
          >
            {isProcessing ? (
              <div className="flex flex-1 items-center justify-center">
                <div className="text-center">
                  <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-[#1F6F54] border-t-transparent mx-auto"></div>
                  <p className="text-white">Product ophalen...</p>
                </div>
              </div>
            ) : (
              <>
                <ScannerView
                  key={scannerKey}
                  onScanSuccess={handleScanSuccess}
                  onError={handleScanError}
                />
                {error && (
                  <div className="absolute bottom-24 left-1/2 -translate-x-1/2 rounded-lg bg-red-500 px-4 py-2 text-white">
                    {error}
                  </div>
                )}
              </>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
