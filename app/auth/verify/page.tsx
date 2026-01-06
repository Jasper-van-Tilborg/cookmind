'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuth } from '@/src/contexts/AuthContext';

function VerifyContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, refreshSession } = useAuth();
  const email = searchParams.get('email');
  const [isVerified, setIsVerified] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    checkVerificationStatus();
    // Check elke 2 seconden of email is geverifieerd
    const interval = setInterval(checkVerificationStatus, 2000);
    return () => clearInterval(interval);
  }, [user]);

  const checkVerificationStatus = async () => {
    await refreshSession();
    // User wordt al gecheckt via useAuth hook
    if (user?.email_confirmed_at) {
      setIsVerified(true);
      setChecking(false);
      // Redirect naar inventory na 2 seconden
      setTimeout(() => {
        router.push('/inventory');
      }, 2000);
    } else {
      setChecking(false);
    }
  };

  if (isVerified) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
        <div className="w-full max-w-md bg-white rounded-lg shadow p-6 text-center">
          <h1 className="text-2xl font-bold mb-4">Email geverifieerd!</h1>
          <p className="text-gray-600 mb-4">Je wordt doorgestuurd...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <div className="w-full max-w-md bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold mb-4">Verifieer je email</h1>
        <p className="text-gray-600 mb-4">
          We hebben een verificatie email gestuurd naar <strong>{email}</strong>
        </p>
        <p className="text-sm text-gray-500 mb-6">
          Klik op de link in de email om je account te verifiëren. Na verificatie word je automatisch doorgestuurd.
        </p>
        
        {checking && (
          <p className="text-sm text-gray-500 text-center">Controleren...</p>
        )}

        <button
          onClick={checkVerificationStatus}
          className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg font-medium mt-4"
        >
          Opnieuw controleren
        </button>
      </div>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Laden...</div>}>
      <VerifyContent />
    </Suspense>
  );
}
