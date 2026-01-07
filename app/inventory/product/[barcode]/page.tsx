'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Loader2, AlertCircle } from 'lucide-react';
import ProductDetail from '@/src/components/inventory/ProductDetail';
import { barcodeAPI, BarcodeProduct } from '@/src/lib/barcode';
import { storage } from '@/src/lib/storage';
import { useAuth } from '@/src/contexts/AuthContext';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const barcode = params.barcode as string;
  
  const [product, setProduct] = useState<BarcodeProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadProduct() {
      if (!barcode) {
        setError('Geen barcode opgegeven');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const productData = await barcodeAPI.lookupProduct(barcode);
        
        if (productData) {
          setProduct(productData);
        } else {
          setError('Product niet gevonden. Probeer een andere barcode of voeg het product handmatig toe.');
        }
      } catch (err) {
        console.error('Error loading product:', err);
        setError('Er is een fout opgetreden bij het laden van het product.');
      } finally {
        setLoading(false);
      }
    }

    loadProduct();
  }, [barcode]);

  const handleAdd = async (quantity: number, unit: string) => {
    if (!product || !user) return;

    try {
      await storage.addInventoryItem(
        {
          name: product.name,
          category: product.category,
          quantity,
          unit,
        },
        user.id
      );
      
      // Navigeer terug naar inventory pagina
      router.push('/inventory');
    } catch (err) {
      console.error('Error adding product:', err);
      alert('Er is een fout opgetreden bij het toevoegen van het product.');
    }
  };

  const handleCancel = () => {
    router.push('/inventory');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center safe-area-inset">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-purple-600 mx-auto mb-4" />
          <p className="text-gray-600">Product laden...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 safe-area-inset">
        <div className="bg-white rounded-lg p-6 max-w-md w-full text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Product niet gevonden</h2>
          <p className="text-gray-600 mb-6">{error || 'Het product kon niet worden geladen.'}</p>
          <div className="flex gap-3">
            <button
              onClick={handleCancel}
              className="flex-1 py-3 px-4 border-2 border-gray-300 rounded-lg text-gray-700 active:bg-gray-50 transition-colors touch-target text-base font-medium"
            >
              Terug
            </button>
            <button
              onClick={() => router.push('/inventory?action=add')}
              className="flex-1 py-3 px-4 bg-purple-600 text-white rounded-lg active:bg-purple-700 transition-colors touch-target text-base font-medium"
            >
              Handmatig toevoegen
            </button>
          </div>
        </div>
      </div>
    );
  }

  return <ProductDetail product={product} onAdd={handleAdd} onCancel={handleCancel} />;
}



