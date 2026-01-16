'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import OnboardingFlow from '@/components/onboarding/OnboardingFlow';

export default function OnboardingPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Check if onboarding already completed in this session
    const completed = sessionStorage.getItem('onboarding_completed');
    if (completed === 'true') {
      router.push('/login');
    }
  }, [router]);

  if (!mounted) {
    return null;
  }

  return <OnboardingFlow />;
}
