'use client';

import { useAuth } from '@/src/contexts/AuthContext';
import BottomNav from './BottomNav';

export default function ConditionalBottomNav() {
  const { user, loading } = useAuth();

  // Toon alleen bottom nav als gebruiker is ingelogd
  if (loading || !user) {
    return null;
  }

  return <BottomNav />;
}


