'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Clock } from 'lucide-react';
import MatchBadge from './MatchBadge';
import SubstitutionBadge from './SubstitutionBadge';
import SubstitutionModal from './SubstitutionModal';
import { Recipe } from '@/src/types';

interface RecipeCardProps {
  recipe: Recipe;
  match: number;
  missingIngredients?: string[];
  onClick?: () => void;
}

export default function RecipeCard({
  recipe,
  match,
  missingIngredients = [],
  onClick,
}: RecipeCardProps) {
  const [selectedIngredient, setSelectedIngredient] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSubstitutionClick = (e: React.MouseEvent, ingredient: string) => {
    e.stopPropagation();
    setSelectedIngredient(ingredient);
    setIsModalOpen(true);
  };

  return (
    <>
      <div
        onClick={onClick}
        className="bg-white rounded-lg shadow-sm overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
      >
      <div className="relative w-full h-48 bg-gray-200">
        {recipe.imageUrl ? (
          <Image
            src={recipe.imageUrl}
            alt={recipe.title}
            fill
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            Geen afbeelding
          </div>
        )}
        <div className="absolute top-3 right-3">
          <MatchBadge percentage={match} size="sm" />
        </div>
      </div>
      
      <div className="p-4">
        <h3 className="font-semibold text-gray-800 mb-1 line-clamp-2">
          {recipe.title}
        </h3>
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
          {recipe.description}
        </p>
        
        <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
          <div className="flex items-center gap-1">
            <Clock size={16} />
            <span>{recipe.prepTime} min</span>
          </div>
          <span>{recipe.servings} personen</span>
        </div>

        {missingIngredients.length > 0 && match < 100 && (
          <div className="pt-3 border-t border-gray-100">
            <p className="text-xs text-gray-500 mb-2">Ontbreekt:</p>
            <div className="space-y-1">
              {missingIngredients.slice(0, 2).map((ingredient, index) => (
                <div key={index} className="flex items-center justify-between gap-2">
                  <span className="text-xs text-gray-700">{ingredient}</span>
                  <SubstitutionBadge
                    onClick={(e) => handleSubstitutionClick(e, ingredient)}
                    loading={false}
                  />
                </div>
              ))}
              {missingIngredients.length > 2 && (
                <p className="text-xs text-gray-500">
                  +{missingIngredients.length - 2} meer
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>

    {isModalOpen && selectedIngredient && (
      <SubstitutionModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedIngredient(null);
        }}
        recipe={recipe}
        missingIngredient={selectedIngredient}
      />
    )}
    </>
  );
}



