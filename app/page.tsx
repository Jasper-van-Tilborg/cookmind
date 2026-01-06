'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/src/contexts/AuthContext';

export default function Home() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (loading) return; // Wacht tot auth state geladen is

    if (user) {
      // Gebruiker is ingelogd, ga naar inventory
      router.push('/inventory');
    } else {
      // Gebruiker is niet ingelogd
      // Check of onboarding al is gezien
      const onboardingSeen = typeof window !== 'undefined' 
        ? localStorage.getItem('cookmind-onboarding-seen') === 'true'
        : false;

      if (onboardingSeen) {
        // Onboarding al gezien, ga naar login
        router.push('/auth/login');
      } else {
        // Eerste keer, ga naar onboarding
        router.push('/onboarding');
      }
    }
  }, [user, loading, router]);

  // Laadscherm terwijl we auth state checken
  return (
    <div className="min-h-screen flex items-center justify-center">
      <p>Laden...</p>
    </div>
  );
}
