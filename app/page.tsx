'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function Home() {
  const router = useRouter();
  const supabase = createClient();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          // Not logged in, redirect to login
          router.push('/login');
          return;
        }

        // User is logged in, check onboarding status
        const onboardingCompleted = sessionStorage.getItem('onboarding_completed');
        if (onboardingCompleted !== 'true') {
          router.push('/onboarding');
          return;
        }

        // User is logged in and onboarding completed, show home page
        setIsLoading(false);
      } catch (error) {
        console.error('Error checking auth:', error);
        // On error, redirect to login
        router.push('/login');
      }
    };

    checkAuth();
  }, [router, supabase]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FAFAF7]">
        <p className="text-[#2B2B2B]">Laden...</p>
      </div>
    );
  }

  // This is the home page for logged in users
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#FAFAF7]">
      <main className="flex flex-col items-center justify-center px-6 py-16 text-center">
        <h1 className="mb-4 text-4xl font-bold text-[#1F6F54]">
          CookMind AI
        </h1>
        <p className="text-lg text-[#2B2B2B]">
          Welkom bij CookMind AI
        </p>
      </main>
    </div>
  );
}
