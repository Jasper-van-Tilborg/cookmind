'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';
import { Recipe } from '@/app/recepten/page';

interface RecipeAIModalProps {
  isOpen: boolean;
  onClose: () => void;
  recipe: Recipe;
  hasAllIngredients: boolean;
  missingIngredients: string[];
}

export default function RecipeAIModal({
  isOpen,
  onClose,
  recipe,
  hasAllIngredients,
  missingIngredients,
}: RecipeAIModalProps) {
  const router = useRouter();
  const supabase = createClient();
  const [prompt, setPrompt] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const suggestions = [
    'Maak het vegetarisch',
    'Maak het minder pittig',
    'Maak het sneller klaar',
    'Maak het gezonder',
    'Maak het voor meer personen',
  ];

  const handleSuggestionClick = (suggestion: string) => {
    setPrompt(suggestion);
  };

  const handleSubmit = async () => {
    if (!prompt.trim()) return;

    setIsProcessing(true);
    setError(null);

    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Je moet ingelogd zijn om recepten aan te passen');
      }

      // Call AI API
      const response = await fetch('/api/claude/recipe-adaptation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          recipe: {
            title: recipe.title,
            description: recipe.description,
            instructions: recipe.instructions,
            ingredients: recipe.ingredients,
          },
          prompt: prompt.trim(),
          missingIngredients: missingIngredients.length > 0 ? missingIngredients : undefined,
        }),
      });

      if (!response.ok) {
        let errorMessage = 'Fout bij aanpassen recept';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorData.details || errorMessage;
        } catch (e) {
          // If response is not JSON, use status text
          errorMessage = `Fout: ${response.statusText || 'Onbekende fout'}`;
        }
        throw new Error(errorMessage);
      }

      const adaptedRecipe = await response.json();

      // Save adapted recipe to database
      const { data, error: dbError } = await supabase
        .from('user_recipe_adaptations')
        .upsert({
          user_id: user.id,
          original_recipe_id: recipe.id,
          title: adaptedRecipe.title,
          description: adaptedRecipe.description,
          instructions: adaptedRecipe.instructions,
          ingredients: adaptedRecipe.ingredients,
          ai_prompt: prompt.trim(),
        }, {
          onConflict: 'user_id,original_recipe_id',
        })
        .select()
        .single();

      if (dbError) {
        throw new Error(dbError.message);
      }

      // Close modal and reload the page to show updated recipe
      onClose();
      
      // Force a full page reload to show the adapted recipe
      window.location.reload();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Onbekende fout bij aanpassen recept';
      setError(errorMessage);
      console.error('Error processing AI request:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-end"
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50"
            onClick={onClose}
          />

          {/* Modal Content */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="relative w-full max-h-[90vh] bg-[#1F6F54] rounded-t-3xl overflow-y-auto"
          >
            <div className="p-6">
              {/* Close Button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-white transition-colors hover:bg-white/30"
                aria-label="Sluiten"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M18 6L6 18M6 6L18 18"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>

              {/* Title */}
              <h2 className="text-2xl font-bold text-white mb-2 pr-10">
                Pas dit recept aan met AI
              </h2>

              {/* Ingredient Status */}
              <div className="mb-6">
                <p className="text-white/80 text-sm mb-2">Ontbrekende ingrediënten</p>
                {hasAllIngredients ? (
                  <div className="flex items-center gap-2 text-white">
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className="text-white"
                    >
                      <path
                        d="M20 6L9 17L4 12"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <span className="text-sm">Je hebt alle ingrediënten in huis</span>
                  </div>
                ) : (
                  <div className="text-white/60 text-sm">
                    {missingIngredients.join(', ')}
                  </div>
                )}
              </div>

              {/* Subtitle */}
              <p className="text-white font-semibold mb-4">
                Pas dit recept aan met AI naar jouw smaak of situatie.
              </p>

              {/* Input Area */}
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Bijvoorbeeld: maak het vegetarisch, minder pittig of sneller klaar"
                className="w-full h-32 rounded-xl bg-[#9FC5B5] px-4 py-3 text-[#2B2B2B] placeholder:text-[#2B2B2B]/60 focus:outline-none focus:ring-2 focus:ring-white/50 resize-none"
              />

              {/* Suggestions */}
              <div className="mt-4">
                <p className="text-white text-sm mb-2">Suggesties:</p>
                <div className="flex flex-wrap gap-2">
                  {suggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="rounded-xl bg-[#9FC5B5] px-4 py-2 text-sm text-[#2B2B2B] font-medium transition-colors hover:bg-[#8FB5A5]"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="mt-4 rounded-xl bg-red-100 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              {/* Submit Button */}
              <button
                onClick={handleSubmit}
                disabled={!prompt.trim() || isProcessing}
                className="mt-6 w-full rounded-xl bg-white px-6 py-4 text-[#1F6F54] font-semibold transition-colors hover:bg-white/90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? 'Verwerken...' : 'Pas recept aan'}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
