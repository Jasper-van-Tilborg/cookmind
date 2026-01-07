'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { X, Search, ScanLine, Loader2, AlertCircle } from 'lucide-react';
import ProductSearchResult from './ProductSearchResult';
import { barcodeAPI, BarcodeProduct } from '@/src/lib/barcode';
import BarcodeScanner from './BarcodeScanner';

interface ProductSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ProductSearchModal({ isOpen, onClose }: ProductSearchModalProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<BarcodeProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isScannerOpen, setIsScannerOpen] = useState(false);

  const performSearch = useCallback(async (query: string) => {
    setLoading(true);
    setError(null);

    try {
      const searchResults = await barcodeAPI.searchProducts(query);
      setResults(searchResults);
      
      if (searchResults.length === 0) {
        setError('Geen producten gevonden. Probeer een andere zoekterm.');
      }
    } catch (err) {
      console.error('Error searching products:', err);
      setError('Er is een fout opgetreden bij het zoeken. Probeer het opnieuw.');
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Debounced search
  useEffect(() => {
    if (!isOpen) {
      setSearchQuery('');
      setResults([]);
      setError(null);
      return;
    }

    const timeoutId = setTimeout(() => {
      if (searchQuery.trim()) {
        performSearch(searchQuery.trim());
      } else {
        setResults([]);
        setError(null);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, isOpen, performSearch]);

  const handleProductClick = (product: BarcodeProduct) => {
    router.push(`/inventory/product/${product.barcode}`);
    onClose();
  };

  const handleClose = () => {
    setSearchQuery('');
    setResults([]);
    setError(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 safe-area-inset">
        <div className="bg-white rounded-t-3xl sm:rounded-2xl w-full max-w-md h-[90vh] sm:h-auto sm:max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between p-4 sm:p-5 border-b bg-white sticky top-0 z-10 safe-area-top">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-800">Product zoeken</h2>
            <button
              onClick={handleClose}
              className="p-2 active:bg-gray-100 rounded-lg transition-colors touch-target flex-shrink-0"
              aria-label="Sluiten"
            >
              <X size={22} className="sm:w-6 sm:h-6" />
            </button>
          </div>

          {/* Search Bar */}
          <div className="p-4 border-b bg-gray-50">
            <div className="flex items-center gap-2">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Zoek producten..."
                  className="w-full pl-10 pr-10 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-base"
                  autoFocus
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-200 rounded"
                    aria-label="Wis zoekopdracht"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
              <button
                onClick={() => setIsScannerOpen(true)}
                className="p-3 bg-blue-600 text-white rounded-lg active:bg-blue-700 transition-colors touch-target flex-shrink-0"
                aria-label="Barcode scannen"
              >
                <ScanLine size={22} />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4 safe-area-bottom">
            {loading && (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-purple-600 mb-4" />
                <p className="text-gray-600">Zoeken...</p>
              </div>
            )}

            {error && !loading && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
                <AlertCircle className="w-6 h-6 text-red-500 mx-auto mb-2" />
                <p className="text-sm text-red-700 mb-3">{error}</p>
                <button
                  onClick={() => searchQuery.trim() && performSearch(searchQuery.trim())}
                  className="text-sm text-red-600 hover:text-red-700 underline"
                >
                  Probeer opnieuw
                </button>
              </div>
            )}

            {!loading && !error && searchQuery.trim() && results.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-600 mb-2">Geen resultaten gevonden</p>
                <p className="text-sm text-gray-500">Probeer een andere zoekterm</p>
              </div>
            )}

            {!loading && !error && !searchQuery.trim() && (
              <div className="text-center py-12">
                <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600">Typ een productnaam om te zoeken</p>
              </div>
            )}

            {!loading && !error && results.length > 0 && (
              <div className="space-y-2">
                {results.map((product) => (
                  <ProductSearchResult
                    key={product.barcode}
                    product={product}
                    onClick={() => handleProductClick(product)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Barcode Scanner */}
      <BarcodeScanner
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
      />
    </>
  );
}

