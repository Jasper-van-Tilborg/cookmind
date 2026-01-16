'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import VoorraadHeader from '@/components/voorraad/VoorraadHeader';
import EmptyState from '@/components/voorraad/EmptyState';
import CookMindBanner from '@/components/voorraad/CookMindBanner';
import SearchSortBar from '@/components/voorraad/SearchSortBar';
import ProductList from '@/components/voorraad/ProductList';
import BottomNav from '@/components/navigation/BottomNav';
import BasisvoorraadModal from '@/components/basisvoorraad/BasisvoorraadModal';
import BarcodeScannerModal from '@/components/barcode/BarcodeScannerModal';
import { InventoryItem } from '@/components/voorraad/ProductCard';

export default function VoorraadPage() {
  const router = useRouter();
  const supabase = createClient();
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'date' | 'quantity'>('date');
  const [isBasisvoorraadModalOpen, setIsBasisvoorraadModalOpen] = useState(false);
  const [isBarcodeModalOpen, setIsBarcodeModalOpen] = useState(false);
  const [basicInventorySelectedIds, setBasicInventorySelectedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const loadData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          router.push('/onboarding');
          return;
        }

        // Load inventory and basic inventory in parallel
        const [inventoryResult, basicInventoryResult] = await Promise.all([
          supabase
            .from('inventory')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false }),
          supabase
            .from('basic_inventory')
            .select('product_id')
            .eq('user_id', user.id),
        ]);

        // Handle inventory
        if (inventoryResult.error) {
          console.error('Error loading inventory:', inventoryResult.error);
          setItems([]);
        } else {
          setItems(inventoryResult.data || []);
        }

        // Handle basic inventory
        if (basicInventoryResult.error) {
          const error = basicInventoryResult.error;
          const errorCode = error?.code;
          const errorMessage = error?.message || '';
          // Check if it's a "relation does not exist" error (table not created yet)
          const isRelationError = 
            errorCode === '42P01' || 
            errorMessage.toLowerCase().includes('does not exist') ||
            errorMessage.toLowerCase().includes('relation') ||
            errorMessage.toLowerCase().includes('table');
          
          // Only log if it's a real error, not just missing table
          if (!isRelationError && errorMessage) {
            console.error('Error loading basic inventory:', {
              code: errorCode,
              message: errorMessage,
              details: error?.details,
              hint: error?.hint,
            });
          }
          // Set empty set if table doesn't exist yet or other error
          setBasicInventorySelectedIds(new Set());
        } else {
          setBasicInventorySelectedIds(
            new Set((basicInventoryResult.data || []).map((item) => item.product_id))
          );
        }

        setIsLoading(false);
      } catch (error) {
        console.error('Error loading data:', error);
        setIsLoading(false);
      }
    };

    loadData();
  }, [router, supabase]);

  const handleAddProduct = () => {
    // TODO: Open add product modal
    console.log('Add product clicked');
  };

  const handleEdit = (item: InventoryItem) => {
    // TODO: Open edit modal
    console.log('Edit item:', item);
  };

  const handleDelete = async (itemId: string) => {
    try {
      const { error } = await supabase
        .from('inventory')
        .delete()
        .eq('id', itemId);

      if (error) {
        console.error('Error deleting item:', error);
        return;
      }

      // Optimistic update
      setItems(items.filter((item) => item.id !== itemId));
    } catch (error) {
      console.error('Error deleting item:', error);
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleSort = (sort: 'name' | 'date' | 'quantity') => {
    setSortBy(sort);
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FAFAF7]">
        <p className="text-[#2B2B2B]">Laden...</p>
      </div>
    );
  }

  const hasItems = items.length > 0;

  const handleToggleBasisvoorraadModal = () => {
    setIsBasisvoorraadModalOpen(!isBasisvoorraadModalOpen);
  };

  const handleCloseBasisvoorraadModal = () => {
    setIsBasisvoorraadModalOpen(false);
  };

  const handleBasicInventorySelectionChange = (selectedIds: Set<string>) => {
    setBasicInventorySelectedIds(selectedIds);
  };

  const handleToggleBarcodeModal = () => {
    setIsBarcodeModalOpen(!isBarcodeModalOpen);
  };

  const handleCloseBarcodeModal = () => {
    setIsBarcodeModalOpen(false);
  };

  const handleProductAdded = async () => {
    // Reload inventory after product is added
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data, error } = await supabase
        .from('inventory')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (!error && data) {
        setItems(data);
      }
    }
  };

  return (
    <>
      <div className="flex min-h-screen flex-col bg-[#FAFAF7]">
        {/* Header - Sticky */}
        <div className="sticky top-0 z-10 bg-[#FAFAF7]">
        <VoorraadHeader
          onCubeClick={handleToggleBasisvoorraadModal}
          onBarcodeClick={handleToggleBarcodeModal}
          onPlusClick={handleAddProduct}
          isBasisvoorraadActive={isBasisvoorraadModalOpen}
          isBarcodeActive={isBarcodeModalOpen}
        />
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto pb-20">
          {!hasItems ? (
            <EmptyState onAddProduct={handleAddProduct} />
          ) : (
            <>
              <CookMindBanner />
              <SearchSortBar onSearch={handleSearch} onSort={handleSort} />
              <ProductList
                items={items}
                onEdit={handleEdit}
                onDelete={handleDelete}
                searchQuery={searchQuery}
                sortBy={sortBy}
              />
            </>
          )}
        </div>

        {/* Bottom Navigation - Sticky */}
        <div className="sticky bottom-0 z-10 bg-[#FAFAF7]">
          <BottomNav 
          onVoorraadClick={
            isBasisvoorraadModalOpen 
              ? handleCloseBasisvoorraadModal 
              : isBarcodeModalOpen 
              ? handleCloseBarcodeModal 
              : undefined
          } 
        />
        </div>
      </div>

      {/* Basisvoorraad Modal */}
      <BasisvoorraadModal
        isOpen={isBasisvoorraadModalOpen}
        onClose={handleCloseBasisvoorraadModal}
        initialSelectedIds={basicInventorySelectedIds}
        onSelectionChange={handleBasicInventorySelectionChange}
        onOpenBarcode={() => {
          handleCloseBasisvoorraadModal();
          handleToggleBarcodeModal();
        }}
        onOpenAddProduct={() => {
          handleCloseBasisvoorraadModal();
          handleAddProduct();
        }}
      />

      {/* Barcode Scanner Modal */}
      <BarcodeScannerModal
        isOpen={isBarcodeModalOpen}
        onClose={handleCloseBarcodeModal}
        onProductAdded={handleProductAdded}
        onOpenBasisvoorraad={() => {
          handleCloseBarcodeModal();
          handleToggleBasisvoorraadModal();
        }}
        onOpenAddProduct={() => {
          handleCloseBarcodeModal();
          handleAddProduct();
        }}
      />
    </>
  );
}
