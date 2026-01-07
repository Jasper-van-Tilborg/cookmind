'use client';

import { usePathname } from 'next/navigation';
import { useAuth } from '@/src/contexts/AuthContext';
import BottomNav from './BottomNav';

// Routes waar de bottom nav moet verschijnen
const NAV_ROUTES = ['/inventory', '/recipes', '/discover', '/profile'];

export default function ConditionalBottomNav() {
  const { user, loading } = useAuth();
  const pathname = usePathname();

  // Toon alleen bottom nav als gebruiker is ingelogd EN op een nav route
  if (loading || !user) {
    return null;
  }

  // Check of huidige route een nav route is (alleen exact match)
  const shouldShowNav = NAV_ROUTES.some(route => pathname === route);

  if (!shouldShowNav) {
    return null;
  }

  return <BottomNav />;
}



