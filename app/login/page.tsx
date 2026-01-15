'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import BackButton from '@/components/auth/BackButton';
import FloatingLabelInput from '@/components/auth/FloatingLabelInput';
import SocialLoginButton from '@/components/auth/SocialLoginButton';

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string; general?: string }>({});
  const [isLoading, setIsLoading] = useState(false);

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
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setErrors({ general: error.message });
        setIsLoading(false);
        return;
      }

      if (data.user) {
        // Check if email is verified
        if (!data.user.email_confirmed_at) {
          setErrors({ 
            general: 'Je e-mailadres is nog niet geverifieerd. Check je inbox voor de verificatielink.' 
          });
          setIsLoading(false);
          return;
        }

        // Check if onboarding is needed
        const onboardingCompleted = sessionStorage.getItem('onboarding_completed');
        if (onboardingCompleted !== 'true') {
          router.push('/onboarding');
        } else {
          router.push('/');
        }
      }
    } catch (error) {
      setErrors({ general: 'Er is iets misgegaan. Probeer het opnieuw.' });
      setIsLoading(false);
    }
  };

  const handleSocialLogin = async (provider: 'google' | 'apple') => {
    // Placeholder for social login - will be implemented when Supabase is configured
    console.log(`${provider} login clicked`);
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-[#FAFAF7] px-6 py-8">
      <div className="absolute left-6 top-8">
        {/* Back button space - login is start page, so no button */}
      </div>

      <div className="mx-auto w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-3xl font-bold text-[#1F6F54]">Log In</h1>
          <p className="text-base text-[#2B2B2B]">
            Vul je gegevens in om direct aan de slag te gaan met CookMind.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mb-6 space-y-4">
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

          <FloatingLabelInput
            id="password"
            label="Wachtwoord"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={errors.password}
            required
            autoComplete="current-password"
          />

          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 rounded border-[#E5E5E0] text-[#1F6F54] focus:ring-[#1F6F54]"
              />
              <span className="text-sm text-[#2B2B2B]">Onthoud Mij</span>
            </label>
            <Link
              href="/forgot-password"
              className="text-sm font-medium text-[#1F6F54] hover:underline"
            >
              Wachtwoord vergeten?
            </Link>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-xl bg-[#1F6F54] px-6 py-4 text-base font-semibold text-[#FAFAF7] shadow-lg transition-colors hover:bg-[#1a5d47] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Bezig met inloggen...' : 'Log In'}
          </button>
        </form>

        <div className="mb-6">
          <Link
            href="/signup"
            className="flex w-full items-center justify-center rounded-xl border-2 border-[#2B2B2B] bg-[#FAFAF7] px-6 py-4 text-base font-semibold text-[#2B2B2B] transition-colors hover:bg-[#E5E5E0]"
          >
            Account aanmaken
          </Link>
        </div>

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
