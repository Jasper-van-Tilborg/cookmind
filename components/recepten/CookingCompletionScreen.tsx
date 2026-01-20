'use client';

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';

interface CookingCompletionScreenProps {
  recipeTitle: string;
  onBackToRecipe: () => void;
}

export default function CookingCompletionScreen({
  recipeTitle,
  onBackToRecipe,
}: CookingCompletionScreenProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex min-h-screen flex-col items-center justify-center bg-[#FAFAF7] px-6"
    >
      <motion.div
        initial={{ scale: 0.8, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: 'spring', damping: 15 }}
        className="text-center"
      >
        {/* Success Icon */}
        <div className="mb-6 flex justify-center">
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-[#1F6F54]">
            <svg
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="text-white"
            >
              <path
                d="M20 6L9 17L4 12"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>

        {/* Title */}
        <h1 className="mb-3 text-3xl font-bold text-[#2B2B2B]">
          Klaar!
        </h1>

        {/* Subtitle */}
        <p className="mb-8 text-lg text-[#2B2B2B]/80">
          Je hebt <span className="font-semibold">{recipeTitle}</span> succesvol bereid!
        </p>

        {/* Button */}
        <button
          onClick={onBackToRecipe}
          className="rounded-xl bg-[#1F6F54] px-8 py-4 text-lg font-semibold text-white transition-colors hover:bg-[#1a5d47]"
        >
          Terug naar recept
        </button>
      </motion.div>
    </motion.div>
  );
}
