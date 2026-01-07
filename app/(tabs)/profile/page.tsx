'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/src/contexts/AuthContext';

export default function ProfilePage() {
  const { user, signOut } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await signOut();
    // Redirect naar login (niet onboarding, want die is al gezien)
    router.push('/auth/login');
  };

  return (
    <div className="p-4 pb-20 max-w-md mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-4">Profiel</h1>
      
      {user && (
        <div className="bg-white rounded-lg p-6 shadow-sm mb-4">
          <p className="text-gray-600 mb-2">
            <strong>Email:</strong> {user.email}
          </p>
          <p className="text-sm text-gray-500">
            {user.email_confirmed_at ? 'Email geverifieerd' : 'Email niet geverifieerd'}
          </p>
        </div>
      )}

      <button
        onClick={handleLogout}
        className="w-full bg-red-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-red-700"
      >
        Uitloggen
      </button>
    </div>
  );
}
