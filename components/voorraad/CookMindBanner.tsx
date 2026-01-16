'use client';

import Link from 'next/link';
import Image from 'next/image';

export default function CookMindBanner() {
  return (
    <div className="mx-6 mb-4 rounded-2xl bg-[#1F6F54] p-6">
      <div className="mb-4 flex items-start gap-4">
        <div className="flex-shrink-0">
          <Image
            src="/cookmind_ai_logo.svg"
            alt="CookMind AI"
            width={40}
            height={40}
            className="object-contain"
            style={{ filter: 'brightness(0) invert(1)' }}
          />
        </div>
        <p className="flex-1 text-base leading-relaxed text-white">
          Ontvang recepten op basis van jouw voorraad met de CookMind AI
        </p>
      </div>
      <Link
        href="/recepten"
        className="block w-full rounded-xl bg-[#9FC5B5] px-6 py-3 text-center text-base font-semibold text-[#1F6F54] transition-colors hover:bg-[#8FB5A5]"
      >
        Bekijk recepten
      </Link>
    </div>
  );
}
