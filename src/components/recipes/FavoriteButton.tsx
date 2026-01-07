'use client';

import { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import { storage } from '@/src/lib/storage';
import { useAuth } from '@/src/contexts/AuthContext';

interface FavoriteButtonProps {
  recipeId: number;
  className?: string;
}

export default function FavoriteButton({ recipeId, className = '' }: FavoriteButtonProps) {
  const { user } = useAuth();
  const [isFavorite, setIsFavorite] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function checkFavorite() {
      if (user) {
        const favorite = await storage.isFavorite(user.id, recipeId);
        setIsFavorite(favorite);
      }
      setIsLoading(false);
    }
    checkFavorite();
  }, [user, recipeId]);

  const handleToggle = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user || isLoading) return;

    setIsLoading(true);
    try {
      if (isFavorite) {
        await storage.removeFavorite(user.id, recipeId);
        setIsFavorite(false);
      } else {
        await storage.addFavorite(user.id, recipeId);
        setIsFavorite(true);
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) return null;

  return (
    <button
      onClick={handleToggle}
      disabled={isLoading}
      className={`p-2 rounded-lg transition-all touch-target ${
        isFavorite
          ? 'bg-red-50 text-red-600 hover:bg-red-100'
          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
      } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
      aria-label={isFavorite ? 'Verwijder uit favorieten' : 'Voeg toe aan favorieten'}
    >
      <Heart 
        size={24} 
        fill={isFavorite ? 'currentColor' : 'none'}
        className={`transition-all ${isFavorite ? 'scale-110' : ''}`}
      />
    </button>
  );
}


