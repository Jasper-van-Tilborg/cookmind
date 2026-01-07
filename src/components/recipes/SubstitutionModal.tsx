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
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 safe-area-inset">
      <div className="bg-white rounded-t-3xl sm:rounded-2xl w-full max-w-lg h-[85vh] sm:h-auto sm:max-h-[80vh] overflow-hidden flex flex-col shadow-2xl">
        {/* Header - Mobile optimized */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b bg-white sticky top-0 z-10 safe-area-top">
          <h2 className="text-base sm:text-lg font-semibold text-gray-800 pr-2">
            AI Substitutie voor <span className="text-purple-600">{missingIngredient}</span>
          </h2>
          <button
            onClick={onClose}
            className="p-2 active:bg-gray-100 rounded-lg transition-colors touch-target flex-shrink-0"
            aria-label="Sluiten"
          >
            <X size={22} className="sm:w-5 sm:h-5" />
          </button>
        </div>

        {/* Content - Mobile optimized scrolling */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 safe-area-bottom">
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

