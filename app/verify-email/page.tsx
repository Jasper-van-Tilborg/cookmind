'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import BackButton from '@/components/auth/BackButton';

export default function VerifyEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const verifyEmail = async () => {
      const token_hash = searchParams.get('token_hash');
      const type = searchParams.get('type');

      if (!token_hash || type !== 'email') {
        setStatus('error');
        setMessage('Ongeldige verificatielink.');
        return;
      }

      try {
        const { error } = await supabase.auth.verifyOtp({
          token_hash,
          type: 'email',
        });

        if (error) {
          setStatus('error');
          setMessage(error.message || 'Verificatie mislukt. Probeer het opnieuw.');
          return;
        }

        setStatus('success');
        setMessage('Je e-mailadres is succesvol geverifieerd!');
        
        // Redirect to login after 2 seconds
        setTimeout(() => {
          router.push('/login');
        }, 2000);
      } catch (error) {
        setStatus('error');
        setMessage('Er is iets misgegaan. Probeer het opnieuw.');
      }
    };

    verifyEmail();
  }, [searchParams, supabase, router]);

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-[#FAFAF7] px-6 py-8">
      <div className="absolute left-6 top-8">
        <BackButton />
      </div>

      <div className="mx-auto w-full max-w-md text-center">
        {status === 'loading' && (
          <>
            <div className="mb-6 flex justify-center">
              <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#1F6F54] border-t-transparent"></div>
            </div>
            <h1 className="mb-2 text-3xl font-bold text-[#1F6F54]">E-mail verifiëren...</h1>
            <p className="text-base text-[#2B2B2B]">
              Je e-mailadres wordt geverifieerd.
            </p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="mb-6 flex justify-center">
              <svg
                className="h-16 w-16 text-[#1F6F54]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h1 className="mb-2 text-3xl font-bold text-[#1F6F54]">E-mail geverifieerd!</h1>
            <p className="mb-6 text-base text-[#2B2B2B]">
              {message}
            </p>
            <p className="text-sm text-[#2B2B2B]">
              Je wordt doorgestuurd naar de login pagina...
            </p>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="mb-6 flex justify-center">
              <svg
                className="h-16 w-16 text-red-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h1 className="mb-2 text-3xl font-bold text-red-600">Verificatie mislukt</h1>
            <p className="mb-6 text-base text-[#2B2B2B]">
              {message}
            </p>
            <div className="flex flex-col gap-4">
              <Link
                href="/login"
                className="rounded-xl bg-[#1F6F54] px-6 py-4 text-base font-semibold text-[#FAFAF7] transition-colors hover:bg-[#1a5d47]"
              >
                Naar login
              </Link>
              <Link
                href="/signup"
                className="rounded-xl border-2 border-[#2B2B2B] bg-[#FAFAF7] px-6 py-4 text-base font-semibold text-[#2B2B2B] transition-colors hover:bg-[#E5E5E0]"
              >
                Nieuw account aanmaken
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
