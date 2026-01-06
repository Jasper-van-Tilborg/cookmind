'use client';

import { useState, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';
import SubstitutionSuggestions from './SubstitutionSuggestions';
import { Recipe, Substitution, InventoryItem } from '@/src/types';
import { storage } from '@/src/lib/storage';
import { useAuth } from '@/src/contexts/AuthContext';

interface SubstitutionModalProps {
  isOpen: boolean;
  onClose: () => void;
  recipe: Recipe;
  missingIngredient: string;
  onSubstitutionAccepted?: (substitution: Substitution) => void;
}

export default function SubstitutionModal({
  isOpen,
  onClose,
  recipe,
  missingIngredient,
  onSubstitutionAccepted,
}: SubstitutionModalProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [substitutions, setSubstitutions] = useState<Substitution[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [userInventory, setUserInventory] = useState<InventoryItem[]>([]);

  useEffect(() => {
    async function loadAndFetch() {
      if (isOpen && user) {
        // Laad inventory eerst
        const inventory = await storage.getInventory(user.id);
        setUserInventory(inventory);

        // Fetch substituties na het laden van inventory
        if (inventory.length > 0) {
          setLoading(true);
          setError(null);
          setSubstitutions([]);

          try {
            const response = await fetch('/api/ai/substitute', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                recipeId: recipe.id,
                missingIngredient,
                userInventory: inventory.map(item => ({
                  id: item.id,
                  name: item.name,
                  category: item.category,
                  quantity: item.quantity,
                  unit: item.unit,
                  expiry: item.expiry,
                })),
              }),
            });

            if (!response.ok) {
              const errorData = await response.json();
              throw new Error(errorData.error || 'Er is een fout opgetreden');
            }

            const data = await response.json();
            setSubstitutions(data.substitutions || []);
          } catch (err: any) {
            setError(err.message || 'Er is een fout opgetreden bij het ophalen van substituties');
          } finally {
            setLoading(false);
          }
        }
      }
    }
    loadAndFetch();
  }, [isOpen, user, recipe.id, missingIngredient]);

  const fetchSubstitutions = async () => {
    setLoading(true);
    setError(null);
    setSubstitutions([]);

    try {
      const response = await fetch('/api/ai/substitute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          recipeId: recipe.id,
          missingIngredient,
          userInventory: userInventory.map(item => ({
            id: item.id,
            name: item.name,
            category: item.category,
            quantity: item.quantity,
            unit: item.unit,
            expiry: item.expiry,
          })),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Er is een fout opgetreden');
      }

      const data = await response.json();
      setSubstitutions(data.substitutions || []);
    } catch (err: any) {
      setError(err.message || 'Er is een fout opgetreden bij het ophalen van substituties');
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = (substitution: Substitution) => {
    if (onSubstitutionAccepted) {
      onSubstitutionAccepted(substitution);
    }
    // Sluit modal na acceptatie
    setTimeout(() => {
      onClose();
    }, 500);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end sm:items-center justify-center p-4">
      <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full max-w-lg max-h-[80vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold text-gray-800">
            AI Substitutie voor {missingIngredient}
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {error ? (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700">{error}</p>
              <button
                onClick={fetchSubstitutions}
                className="mt-3 text-sm text-red-600 hover:text-red-700 underline"
              >
                Probeer opnieuw
              </button>
            </div>
          ) : (
            <SubstitutionSuggestions
              originalIngredient={missingIngredient}
              substitutions={substitutions}
              loading={loading}
              onAccept={handleAccept}
            />
          )}
        </div>
      </div>
    </div>
  );
}

