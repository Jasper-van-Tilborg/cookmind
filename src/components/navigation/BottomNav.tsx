'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Package, BookOpen, Compass, User } from 'lucide-react';

const navItems = [
  { href: '/inventory', icon: Package, label: 'Voorraad' },
  { href: '/recipes', icon: BookOpen, label: 'Recepten' },
  { href: '/discover', icon: Compass, label: 'Ontdekken' },
  { href: '/profile', icon: User, label: 'Profiel' },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-gray-200 z-50">
      <div className="flex h-full items-center justify-around max-w-md mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center gap-1 flex-1 h-full transition-colors ${
                isActive ? 'text-purple-600' : 'text-gray-400'
              }`}
            >
              <Icon size={24} />
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}


