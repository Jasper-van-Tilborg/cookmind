'use client';

interface EmptyStateProps {
  onAddProduct: () => void;
}

export default function EmptyState({ onAddProduct }: EmptyStateProps) {
  return (
    <div className="flex flex-1 items-center justify-center px-6">
      <div className="w-full max-w-md">
        <div className="rounded-2xl bg-[#1F6F54] p-8 text-center">
          <p className="mb-2 text-lg font-semibold text-white">
            Je voorraad is nog leeg
          </p>
          <p className="mb-6 text-base text-white/90">
            Voeg producten toe om recepten te krijgen
          </p>
          <button
            onClick={onAddProduct}
            className="w-full rounded-xl bg-[#9FC5B5] px-6 py-4 text-base font-semibold text-[#1F6F54] transition-colors hover:bg-[#8FB5A5]"
          >
            + Product toevoegen
          </button>
        </div>
      </div>
    </div>
  );
}
