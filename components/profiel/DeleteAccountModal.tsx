'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';
import FloatingLabelInput from '@/components/auth/FloatingLabelInput';

interface DeleteAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAccountDeleted: () => void;
}

export default function DeleteAccountModal({
  isOpen,
  onClose,
  onAccountDeleted,
}: DeleteAccountModalProps) {
  const supabase = createClient();
  const [password, setPassword] = useState('');
  const [confirmText, setConfirmText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setPassword('');
      setConfirmText('');
      setError(null);
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!password) {
      setError('Wachtwoord is verplicht');
      return;
    }

    if (confirmText.toLowerCase() !== 'verwijderen') {
      setError('Typ "verwijderen" om te bevestigen');
      return;
    }

    setIsLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setError('Je moet ingelogd zijn om je account te verwijderen');
        setIsLoading(false);
        return;
      }

      // Verify password
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email!,
        password: password,
      });

      if (signInError) {
        setError('Wachtwoord is onjuist');
        setIsLoading(false);
        return;
      }

      // Delete all user data
      const userId = user.id;

      // Delete in parallel for better performance
      const deleteResults = await Promise.all([
        supabase.from('inventory').delete().eq('user_id', userId),
        supabase.from('basic_inventory').delete().eq('user_id', userId),
        supabase.from('user_recipe_adaptations').delete().eq('user_id', userId),
        supabase.from('user_custom_tags').delete().eq('user_id', userId),
        supabase.from('profiles').delete().eq('id', userId),
      ]);

      // Check for errors
      const hasError = deleteResults.some(result => result.error);
      if (hasError) {
        setError('Fout bij verwijderen van gegevens. Probeer het opnieuw.');
        setIsLoading(false);
        return;
      }

      // Sign out user
      await supabase.auth.signOut();

      // Redirect to onboarding
      onAccountDeleted();
    } catch (err) {
      setError('Er is iets misgegaan. Probeer het opnieuw.');
      console.error('Error deleting account:', err);
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
              <h2 className="text-2xl font-bold text-[#2B2B2B] mb-2 pr-10">
                Account verwijderen
              </h2>

              {/* Warning */}
              <div className="mb-6 rounded-xl bg-red-50 border border-red-200 p-4">
                <div className="flex items-start gap-3">
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="text-red-600 shrink-0 mt-0.5"
                  >
                    <path
                      d="M12 9V13M12 17H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <div>
                    <p className="text-sm font-semibold text-red-800 mb-1">
                      Waarschuwing: Deze actie is onomkeerbaar
                    </p>
                    <p className="text-sm text-red-700">
                      Alle je gegevens, producten, recepten en instellingen worden permanent verwijderd. Deze actie kan niet ongedaan worden gemaakt.
                    </p>
                  </div>
                </div>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="rounded-xl bg-red-50 p-4 text-sm text-red-600">
                    {error}
                  </div>
                )}

                <FloatingLabelInput
                  id="password"
                  label="Wachtwoord"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                />

                <div>
                  <FloatingLabelInput
                    id="confirmText"
                    label='Typ "verwijderen" om te bevestigen'
                    type="text"
                    value={confirmText}
                    onChange={(e) => setConfirmText(e.target.value)}
                    required
                  />
                </div>

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
                    disabled={isLoading || !password || confirmText.toLowerCase() !== 'verwijderen'}
                    className="flex-1 rounded-xl bg-red-600 px-6 py-3 text-base font-semibold text-white transition-colors hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? 'Verwijderen...' : 'Account verwijderen'}
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
