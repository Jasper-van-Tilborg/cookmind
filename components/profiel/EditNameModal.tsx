'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';
import FloatingLabelInput from '@/components/auth/FloatingLabelInput';

interface EditNameModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentName: string;
  onNameUpdated: () => void;
}

export default function EditNameModal({
  isOpen,
  onClose,
  currentName,
  onNameUpdated,
}: EditNameModalProps) {
  const supabase = createClient();
  const [name, setName] = useState(currentName);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setName(currentName);
      setError(null);
      setSuccess(false);
    }
  }, [isOpen, currentName]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!name.trim()) {
      setError('Naam is verplicht');
      return;
    }

    setIsLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setError('Je moet ingelogd zijn om je naam te wijzigen');
        setIsLoading(false);
        return;
      }

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ name: name.trim() })
        .eq('id', user.id);

      if (updateError) {
        setError(updateError.message || 'Fout bij bijwerken naam');
        setIsLoading(false);
        return;
      }

      setSuccess(true);
      setTimeout(() => {
        onNameUpdated();
        onClose();
      }, 1000);
    } catch (err) {
      setError('Er is iets misgegaan. Probeer het opnieuw.');
      console.error('Error updating name:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

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
            className="relative w-full max-h-[90vh] bg-white rounded-t-3xl overflow-y-auto"
          >
            <div className="p-6">
              {/* Close Button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-full bg-[#E5E5E0] text-[#2B2B2B] transition-colors hover:bg-[#D5D5D0]"
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
              <h2 className="text-2xl font-bold text-[#2B2B2B] mb-6 pr-10">
                Naam bewerken
              </h2>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="rounded-xl bg-red-50 p-4 text-sm text-red-600">
                    {error}
                  </div>
                )}

                {success && (
                  <div className="rounded-xl bg-green-50 p-4 text-sm text-green-600">
                    Naam succesvol bijgewerkt!
                  </div>
                )}

                <FloatingLabelInput
                  id="name"
                  label="Naam"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  error={error && !name.trim() ? error : undefined}
                  required
                  autoComplete="name"
                />

                {/* Buttons */}
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={onClose}
                    disabled={isLoading}
                    className="flex-1 rounded-xl border-2 border-[#E5E5E0] bg-white px-6 py-3 text-base font-semibold text-[#2B2B2B] transition-colors hover:bg-[#E5E5E0] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Annuleren
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading || !name.trim()}
                    className="flex-1 rounded-xl bg-[#1F6F54] px-6 py-3 text-base font-semibold text-white transition-colors hover:bg-[#1a5d47] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? 'Opslaan...' : 'Opslaan'}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
