'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import BackButton from '@/components/auth/BackButton';
import FloatingLabelInput from '@/components/auth/FloatingLabelInput';

export default function ForgotPasswordPage() {
  const supabase = createClient();
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState<{ email?: string; general?: string }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Validation
    if (!email) {
      setErrors({ email: 'E-mailadres is verplicht' });
      return;
    }
    if (!validateEmail(email)) {
      setErrors({ email: 'Ongeldig e-mailadres' });
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        setErrors({ general: error.message });
        setIsLoading(false);
        return;
      }

      setIsSuccess(true);
    } catch (error) {
      setErrors({ general: 'Er is iets misgegaan. Probeer het opnieuw.' });
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="relative flex min-h-screen items-center justify-center bg-[#FAFAF7] px-6 py-8">
        <div className="absolute left-6 top-8">
          <BackButton />
        </div>

        <div className="mx-auto w-full max-w-md">
          <div className="mb-8 text-center">
            <h1 className="mb-2 text-3xl font-bold text-[#1F6F54]">E-mail verzonden</h1>
            <p className="text-base text-[#2B2B2B]">
              We hebben een link naar {email} gestuurd om je wachtwoord opnieuw in te stellen.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-[#FAFAF7] px-6 py-8">
      <div className="absolute left-6 top-8">
        <BackButton />
      </div>

      <div className="mx-auto w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-3xl font-bold text-[#1F6F54]">Wachtwoord vergeten?</h1>
          <p className="text-base text-[#2B2B2B]">
            Vul je e-mailadres in en ontvang een link om je wachtwoord opnieuw in te stellen.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {errors.general && (
            <div className="rounded-xl bg-red-50 p-4 text-sm text-red-600">
              {errors.general}
            </div>
          )}

          <FloatingLabelInput
            id="email"
            label="E-mailadres"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={errors.email}
            required
            autoComplete="email"
          />

          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-xl bg-[#1F6F54] px-6 py-4 text-base font-semibold text-[#FAFAF7] shadow-lg transition-colors hover:bg-[#1a5d47] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Verzenden...' : 'Doorgaan'}
          </button>
        </form>
      </div>
    </div>
  );
}
