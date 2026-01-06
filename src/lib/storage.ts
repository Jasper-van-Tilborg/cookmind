import { InventoryItem } from '@/src/types';
import { supabase } from './supabase';
import { Database } from './database.types';

const STORAGE_KEY = 'cookmind-data';

export interface StorageData {
  inventory: InventoryItem[];
}

// Helper om LocalStorage te gebruiken als fallback
const localStorageFallback = {
  get: (): StorageData | null => {
    if (typeof window === 'undefined') return null;
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return null;
    }
  },
  set: (data: StorageData): void => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Error writing to localStorage:', error);
    }
  },
};

// Supabase storage functions
export const storage = {
  // Haal inventory op uit Supabase (of LocalStorage als fallback)
  getInventory: async (userId?: string | null): Promise<InventoryItem[]> => {
    // Check if Supabase is configured
    if (!supabase) {
      const localData = localStorageFallback.get();
      return localData?.inventory || [];
    }

    try {
      // Probeer Supabase eerst
      let query = supabase!
        .from('inventory')
        .select('*');
      
      // Filter op user_id als beschikbaar
      if (userId) {
        query = query.eq('user_id', userId);
      }
      
      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) {
        console.warn('Supabase error, falling back to localStorage:', error);
        // Fallback naar LocalStorage
        const localData = localStorageFallback.get();
        return localData?.inventory || [];
      }

      // Converteer Supabase data naar InventoryItem format
      // Gebruik een hash van de UUID als number ID voor compatibiliteit
      if (!data) return [];
      
      return data.map((item: { id: string; name: string; category: string; quantity: number; unit: string | null; expiry: string | null }) => {
        // Convert UUID to a consistent number (hash)
        let numericId = 0;
        for (let i = 0; i < item.id.length; i++) {
          numericId = ((numericId << 5) - numericId) + item.id.charCodeAt(i);
          numericId = numericId & numericId; // Convert to 32bit integer
        }
        return {
          id: Math.abs(numericId) || Date.now(),
          name: item.name,
          category: item.category,
          quantity: Number(item.quantity),
          unit: item.unit || undefined,
          expiry: item.expiry ? new Date(item.expiry) : undefined,
        };
      });
    } catch (error) {
      console.error('Error fetching inventory:', error);
      // Fallback naar LocalStorage
      const localData = localStorageFallback.get();
      return localData?.inventory || [];
    }
  },

  // Sla inventory op in Supabase (of LocalStorage als fallback)
  setInventory: async (inventory: InventoryItem[], userId?: string | null): Promise<void> => {
    // Check if Supabase is configured
    if (!supabase) {
      localStorageFallback.set({ inventory });
      return;
    }

    try {
      // Verwijder eerst alle bestaande items voor deze gebruiker
      if (userId) {
        await supabase!.from('inventory').delete().eq('user_id', userId);
      } else {
        await supabase!.from('inventory').delete().neq('id', '');
      }

      // Voeg nieuwe items toe
      // Supabase genereert automatisch UUIDs, dus we geven geen id mee
      const itemsToInsert: Database['public']['Tables']['inventory']['Insert'][] = inventory.map(item => ({
        name: item.name,
        category: item.category,
        quantity: item.quantity,
        unit: item.unit || null,
        expiry: item.expiry?.toISOString() || null,
        user_id: userId || null,
      }));

      const { error } = await supabase!
        .from('inventory')
        .insert(itemsToInsert as any);

      if (error) {
        console.warn('Supabase error, falling back to localStorage:', error);
        // Fallback naar LocalStorage
        localStorageFallback.set({ inventory });
      }
    } catch (error) {
      console.error('Error saving inventory:', error);
      // Fallback naar LocalStorage
      localStorageFallback.set({ inventory });
    }
  },

  // Voeg één item toe
  addInventoryItem: async (item: Omit<InventoryItem, 'id'>, userId?: string | null): Promise<InventoryItem> => {
    // Check if Supabase is configured
    if (!supabase) {
      // Fallback: genereer lokaal ID
      return {
        ...item,
        id: Date.now(),
      };
    }

    try {
      const newItem = {
        name: item.name,
        category: item.category,
        quantity: item.quantity,
        unit: item.unit || null,
        expiry: item.expiry?.toISOString() || null,
        user_id: userId || null,
      };

      const { data, error } = await supabase!
        .from('inventory')
        .insert(newItem as any)
        .select()
        .single();

      if (error) throw error;
      if (!data) throw new Error('No data returned');

      const itemData = data as Database['public']['Tables']['inventory']['Row'];

      // Convert UUID to numeric ID for compatibility
      let numericId = 0;
      for (let i = 0; i < itemData.id.length; i++) {
        numericId = ((numericId << 5) - numericId) + itemData.id.charCodeAt(i);
        numericId = numericId & numericId;
      }

      return {
        id: Math.abs(numericId) || Date.now(),
        name: itemData.name,
        category: itemData.category,
        quantity: Number(itemData.quantity),
        unit: itemData.unit || undefined,
        expiry: itemData.expiry ? new Date(itemData.expiry) : undefined,
      };
    } catch (error) {
      console.error('Error adding inventory item:', error);
      // Fallback: genereer lokaal ID
      return {
        ...item,
        id: Date.now(),
      };
    }
  },

  // Verwijder één item
  deleteInventoryItem: async (id: number): Promise<void> => {
    // Check if Supabase is configured
    if (!supabase) {
      return; // LocalStorage wordt niet gebruikt voor individuele items
    }

    try {
      // We moeten eerst het item vinden op basis van de numeric ID
      // Dit is niet ideaal, maar voor nu werken we met een workaround
      // TODO: Gebruik een extra kolom 'numeric_id' of gebruik UUIDs direct
      const { data: items } = await supabase!
        .from('inventory')
        .select('id');

      // Find matching item by converting UUIDs to numbers
      let itemToDelete: string | null = null;
      if (items) {
        const typedItems = items as { id: string }[];
        for (const item of typedItems) {
          let numericId = 0;
          for (let i = 0; i < item.id.length; i++) {
            numericId = ((numericId << 5) - numericId) + item.id.charCodeAt(i);
            numericId = numericId & numericId;
          }
          if (Math.abs(numericId) === id) {
            itemToDelete = item.id;
            break;
          }
        }
      }

      if (itemToDelete) {
        const { error } = await supabase!
          .from('inventory')
          .delete()
          .eq('id', itemToDelete);

        if (error) {
          console.warn('Supabase error deleting item:', error);
        }
      }
    } catch (error) {
      console.error('Error deleting inventory item:', error);
    }
  },

  // Clear alle data
  clear: async (): Promise<void> => {
    if (!supabase) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem(STORAGE_KEY);
      }
      return;
    }

    try {
      await supabase!.from('inventory').delete().neq('id', '');
    } catch (error) {
      console.error('Error clearing inventory:', error);
      if (typeof window !== 'undefined') {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  },
};


