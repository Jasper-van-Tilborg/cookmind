'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface BottomNavProps {
  onVoorraadClick?: () => void;
}

export default function BottomNav({ onVoorraadClick }: BottomNavProps = {}) {
  const pathname = usePathname();

  const isActive = (path: string) => {
    if (path === '/') {
      return pathname === '/' || pathname.startsWith('/voorraad');
    }
    return pathname.startsWith(path);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-[#E5E5E0] bg-[#FAFAF7] px-6 py-3">
      <div className="mx-auto flex max-w-md items-center justify-around">
        <Link
          href="/"
          onClick={onVoorraadClick}
          className="flex flex-col items-center gap-1 transition-opacity hover:opacity-80"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={isActive('/') ? 'text-[#1F6F54]' : 'text-[#2B2B2B]'}
          >
            <path
              d="M3 12L5 10M5 10L12 3L19 10M5 10V20C5 20.5523 5.44772 21 6 21H9M19 10L21 12M19 10V20C19 20.5523 18.5523 21 18 21H15M9 21C9.55228 21 10 20.5523 10 20V16C10 15.4477 10.4477 15 11 15H13C13.5523 15 14 15.4477 14 16V20C14 20.5523 14.4477 21 15 21M9 21H15"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span
            className={`text-xs font-medium ${
              isActive('/') ? 'text-[#1F6F54]' : 'text-[#2B2B2B]'
            }`}
          >
            Voorraad
          </span>
        </Link>

        <Link
          href="/recepten"
          className="flex flex-col items-center gap-1 transition-opacity hover:opacity-80"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={isActive('/recepten') ? 'text-[#1F6F54]' : 'text-[#2B2B2B]'}
          >
            <path
              d="M4 19.5C4 18.837 4.26339 18.2011 4.73223 17.7322C5.20107 17.2634 5.83696 17 6.5 17H20M4 19.5C4 20.163 4.26339 20.7989 4.73223 21.2678C5.20107 21.7366 5.83696 22 6.5 22H20M4 19.5V4.5C4 3.83696 4.26339 3.20107 4.73223 2.73223C5.20107 2.26339 5.83696 2 6.5 2H20V22M9 7H15M9 11H15M9 15H11"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span
            className={`text-xs font-medium ${
              isActive('/recepten') ? 'text-[#1F6F54]' : 'text-[#2B2B2B]'
            }`}
          >
            Recepten
          </span>
        </Link>

        <Link
          href="/profiel"
          className="flex flex-col items-center gap-1 transition-opacity hover:opacity-80"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={isActive('/profiel') ? 'text-[#1F6F54]' : 'text-[#2B2B2B]'}
          >
            <path
              d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21M16 7C16 9.20914 14.2091 11 12 11C9.79086 11 8 9.20914 8 7C8 4.79086 9.79086 3 12 3C14.2091 3 16 4.79086 16 7Z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span
            className={`text-xs font-medium ${
              isActive('/profiel') ? 'text-[#1F6F54]' : 'text-[#2B2B2B]'
            }`}
          >
            Profiel
          </span>
        </Link>
      </div>
    </nav>
  );
}
