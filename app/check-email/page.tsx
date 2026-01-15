'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import BackButton from '@/components/auth/BackButton';

export default function CheckEmailPage() {
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || 'je e-mailadres';

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-[#FAFAF7] px-6 py-8">
      <div className="absolute left-6 top-8">
        <BackButton />
      </div>

      <div className="mx-auto w-full max-w-md text-center">
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
              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
        </div>

        <h1 className="mb-2 text-3xl font-bold text-[#1F6F54]">Check je e-mail</h1>
        <p className="mb-6 text-base text-[#2B2B2B]">
          We hebben een verificatielink gestuurd naar <span className="font-semibold">{email}</span>.
        </p>
        <p className="mb-8 text-sm text-[#2B2B2B]">
          Klik op de link in de e-mail om je account te activeren. Controleer ook je spam folder als je de e-mail niet ziet.
        </p>

        <div className="space-y-4">
          <Link
            href="/login"
            className="block w-full rounded-xl bg-[#1F6F54] px-6 py-4 text-base font-semibold text-[#FAFAF7] transition-colors hover:bg-[#1a5d47]"
          >
            Naar login
          </Link>
          <p className="text-sm text-[#2B2B2B]">
            Al geverifieerd?{' '}
            <Link href="/login" className="font-medium text-[#1F6F54] hover:underline">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
