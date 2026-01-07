'use client';

import { useState } from 'react';
import { X, Sparkles, Loader2, Check, ArrowLeft } from 'lucide-react';
import { Recipe } from '@/src/types';

interface AITweakerProps {
  recipe: Recipe;
  userInventory: string[];
  isOpen: boolean;
  onClose: () => void;
  onAccept: (modifiedRecipe: Recipe) => void;
}

export default function AITweaker({
  recipe,
  userInventory,
  isOpen,
  onClose,
  onAccept,
}: AITweakerProps) {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewRecipe, setPreviewRecipe] = useState<Recipe | null>(null);

  if (!isOpen) return null;

  const handleTweak = async () => {
    if (!prompt.trim()) {
      setError('Voer een verzoek in');
      return;
    }

    setLoading(true);
    setError(null);
    setPreviewRecipe(null);

    try {
      // Haal inventory items op (we hebben alleen namen, maar API verwacht volledige items)
      const inventoryItems = userInventory.map((name, index) => ({
        id: index,
        name,
        category: 'Overig',
        quantity: 1,
      }));

      const response = await fetch('/api/ai/tweak', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          recipe,
          userPrompt: prompt,
          userInventory: inventoryItems,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Er is een fout opgetreden');
      }

      const data = await response.json();
      setPreviewRecipe(data.modifiedRecipe);
    } catch (err: any) {
      setError(err.message || 'Er is een fout opgetreden bij het aanpassen van het recept');
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = () => {
    if (previewRecipe) {
      onAccept(previewRecipe);
      handleClose();
    }
  };

  const handleClose = () => {
    setPrompt('');
    setError(null);
    setPreviewRecipe(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 safe-area-inset">
      <div className="bg-white rounded-t-3xl sm:rounded-2xl w-full max-w-2xl h-[90vh] sm:h-auto sm:max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
        {/* Header - Mobile optimized */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b bg-white sticky top-0 z-10 safe-area-top">
          <div className="flex items-center gap-2 sm:gap-3">
            <Sparkles size={20} className="text-purple-600 sm:w-5 sm:h-5" />
            <h2 className="text-base sm:text-lg font-semibold text-gray-800">AI Tweaker</h2>
          </div>
          <button
            onClick={handleClose}
            className="p-2 active:bg-gray-100 rounded-lg transition-colors touch-target flex-shrink-0"
            aria-label="Sluiten"
          >
            <X size={22} className="sm:w-5 sm:h-5" />
          </button>
        </div>

        {/* Content - Mobile optimized scrolling */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 sm:space-y-5 safe-area-bottom">
          {!previewRecipe ? (
            <>
              <div>
                <p className="text-sm text-gray-600 mb-2">
                  Pas het recept <strong>{recipe.title}</strong> aan naar jouw wensen.
                </p>
                <p className="text-xs text-gray-500 mb-4">
                  Bijvoorbeeld: "Maak dit Italiaans", "Maak dit vegetarisch", "Maak dit pittiger"
                </p>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Beschrijf hoe je het recept wilt aanpassen..."
                  className="w-full p-3 sm:p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none text-base"
                  rows={5}
                  disabled={loading}
                />
              </div>

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}

              <button
                onClick={handleTweak}
                disabled={loading || !prompt.trim()}
                className="w-full bg-purple-600 text-white py-3.5 sm:py-3 px-4 rounded-lg font-medium active:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 touch-target text-base"
              >
                {loading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    <span>AI werkt...</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={18} />
                    <span>Pas recept aan</span>
                  </>
                )}
              </button>
            </>
          ) : (
            <>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-md font-semibold text-gray-800">Preview</h3>
                <button
                  onClick={() => setPreviewRecipe(null)}
                  className="text-sm text-purple-600 hover:text-purple-700 flex items-center gap-1"
                >
                  <ArrowLeft size={16} />
                  <span>Terug</span>
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-800 mb-1">{previewRecipe.title}</h4>
                  <p className="text-sm text-gray-600">{previewRecipe.description}</p>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">Ingrediënten:</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                    {previewRecipe.ingredients.map((ing, idx) => (
                      <li key={idx}>
                        {ing.amount} {ing.unit} {ing.name}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">Bereidingswijze:</h4>
                  <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
                    {previewRecipe.steps.map((step, idx) => (
                      <li key={idx}>{step}</li>
                    ))}
                  </ol>
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t sticky bottom-0 bg-white pb-2">
                <button
                  onClick={handleClose}
                  className="flex-1 py-3 px-4 border border-gray-300 rounded-lg text-gray-700 active:bg-gray-50 transition-colors touch-target text-base font-medium"
                >
                  Annuleren
                </button>
                <button
                  onClick={handleAccept}
                  className="flex-1 py-3 px-4 bg-purple-600 text-white rounded-lg active:bg-purple-700 transition-colors flex items-center justify-center gap-2 touch-target text-base font-medium"
                >
                  <Check size={18} />
                  <span>Accepteer</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}


