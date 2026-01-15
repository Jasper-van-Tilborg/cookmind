'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import BackButton from '@/components/auth/BackButton';
import FloatingLabelInput from '@/components/auth/FloatingLabelInput';
import SocialLoginButton from '@/components/auth/SocialLoginButton';

export default function SignupPage() {
  const router = useRouter();
  const supabase = createClient();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ name?: string; email?: string; password?: string; general?: string }>({});
  const [isLoading, setIsLoading] = useState(false);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Validation
    if (!name.trim()) {
      setErrors({ name: 'Naam is verplicht' });
      return;
    }
    if (!email) {
      setErrors({ email: 'E-mailadres is verplicht' });
      return;
    }
    if (!validateEmail(email)) {
      setErrors({ email: 'Ongeldig e-mailadres' });
      return;
    }
    if (!password) {
      setErrors({ password: 'Wachtwoord is verplicht' });
      return;
    }
    if (password.length < 6) {
      setErrors({ password: 'Wachtwoord moet minimaal 6 karakters bevatten' });
      return;
    }

    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/verify-email`,
          data: {
            name: name.trim(),
          },
        },
      });

      if (error) {
        setErrors({ general: error.message });
        setIsLoading(false);
        return;
      }

      if (data.user) {
        // Redirect to check email page
        // Note: user.email might be null, so we use the email from the form
        router.push(`/check-email?email=${encodeURIComponent(email)}`);
      }
    } catch (error) {
      setErrors({ general: 'Er is iets misgegaan. Probeer het opnieuw.' });
      setIsLoading(false);
    }
  };

  const handleSocialLogin = async (provider: 'google' | 'apple') => {
    // Placeholder for social login - will be implemented when Supabase is configured
    console.log(`${provider} signup clicked`);
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-[#FAFAF7] px-6 py-8">
      <div className="absolute left-6 top-8">
        <BackButton />
      </div>

      <div className="mx-auto w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-3xl font-bold text-[#1F6F54]">Account aanmaken</h1>
          <p className="text-base text-[#2B2B2B]">
            Maak een account aan om je voorraad te beheren en slimme recepten te ontdekken.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mb-6 space-y-4">
          {errors.general && (
            <div className="rounded-xl bg-red-50 p-4 text-sm text-red-600">
              {errors.general}
            </div>
          )}

          <FloatingLabelInput
            id="name"
            label="Naam"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            error={errors.name}
            required
            autoComplete="name"
          />

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

          <FloatingLabelInput
            id="password"
            label="Wachtwoord"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={errors.password}
            required
            autoComplete="new-password"
          />

          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-xl bg-[#1F6F54] px-6 py-4 text-base font-semibold text-[#FAFAF7] shadow-lg transition-colors hover:bg-[#1a5d47] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Account aanmaken...' : 'Account aanmaken'}
          </button>
        </form>

        <div className="mb-6 flex items-center gap-4">
          <div className="h-px flex-1 bg-[#E5E5E0]"></div>
          <span className="text-sm text-[#2B2B2B]">Of ga verder met</span>
          <div className="h-px flex-1 bg-[#E5E5E0]"></div>
        </div>

        <div className="flex gap-4">
          <SocialLoginButton provider="google" onClick={() => handleSocialLogin('google')} />
          <SocialLoginButton provider="apple" onClick={() => handleSocialLogin('apple')} />
        </div>
      </div>
    </div>
  );
}
