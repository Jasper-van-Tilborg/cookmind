'use client';

import { useRouter } from 'next/navigation';
import { Sparkles } from 'lucide-react';

interface InventoryCTAProps {
  itemCount: number;
}

export default function InventoryCTA({ itemCount }: InventoryCTAProps) {
  const router = useRouter();

  return (
    <div className="bg-gradient-to-br from-purple-600 to-purple-700 rounded-xl p-6 text-white shadow-lg">
      <div className="flex items-start gap-3 mb-4">
        <Sparkles className="mt-1" size={24} />
        <div>
          <h2 className="text-xl font-bold mb-1">
            Laat CookMind AI recepten vinden
          </h2>
          <p className="text-purple-100 text-sm">
            Je hebt {itemCount} {itemCount === 1 ? 'ingrediënt' : 'ingrediënten'} in voorraad
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <button
          onClick={() => router.push('/recipes')}
          className="w-full bg-white text-purple-600 font-semibold py-3 px-4 rounded-lg hover:bg-purple-50 transition-colors"
        >
          Recepten vinden met AI
        </button>
        <button
          disabled
          className="w-full bg-purple-500/50 text-white/70 font-semibold py-3 px-4 rounded-lg cursor-not-allowed"
        >
          Eigen recept delen
        </button>
      </div>
    </div>
  );
}







