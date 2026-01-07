'use client';

import DiscoverFeed from '@/src/components/discover/DiscoverFeed';

export default function DiscoverPage() {
  return (
    <div className="p-4 pb-20 max-w-md mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Ontdekken</h1>
      <DiscoverFeed limit={50} />
    </div>
  );
}



