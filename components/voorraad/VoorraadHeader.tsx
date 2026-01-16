'use client';

import Image from 'next/image';

interface VoorraadHeaderProps {
  onCubeClick?: () => void;
  onBarcodeClick?: () => void;
  onPlusClick?: () => void;
  onTitleClick?: () => void;
  isBasisvoorraadActive?: boolean;
  isBarcodeActive?: boolean;
  isPlusActive?: boolean;
}

export default function VoorraadHeader({
  onCubeClick,
  onBarcodeClick,
  onPlusClick,
  onTitleClick,
  isBasisvoorraadActive = false,
  isBarcodeActive = false,
  isPlusActive = false,
}: VoorraadHeaderProps) {
  return (
    <header className="flex items-center justify-between px-6 py-4">
      {onTitleClick ? (
        <button
          onClick={onTitleClick}
          className="text-2xl font-bold text-[#1F6F54] transition-opacity hover:opacity-80"
        >
          Voorraad
        </button>
      ) : (
        <h1 className="text-2xl font-bold text-[#1F6F54]">Voorraad</h1>
      )}
      
      <div className="flex gap-2">
        {/* Basisvoorraad icon */}
        <button
          onClick={onCubeClick}
          className={`flex h-10 w-10 items-center justify-center rounded-lg transition-colors ${
            isBasisvoorraadActive
              ? 'bg-[#D6EDE2] hover:bg-[#C6DDD2]'
              : 'bg-[#E5E5E0] hover:bg-[#D5D5D0]'
          }`}
          aria-label="Basisvoorraad"
        >
          <Image
            src="/basisvoorraad_icon.svg"
            alt="Basisvoorraad"
            width={20}
            height={20}
            className="object-contain"
          />
        </button>

        {/* Barcode scanner icon */}
        <button
          onClick={onBarcodeClick}
          className={`flex h-10 w-10 items-center justify-center rounded-lg transition-colors ${
            isBarcodeActive
              ? 'bg-[#D6EDE2] hover:bg-[#C6DDD2]'
              : 'bg-[#E5E5E0] hover:bg-[#D5D5D0]'
          }`}
          aria-label="Scan product"
        >
          <Image
            src="/barcode_scanner_icon.svg"
            alt="Barcode scanner"
            width={20}
            height={20}
            className="object-contain"
          />
        </button>

        {/* Product toevoegen icon */}
        <button
          onClick={onPlusClick}
          className={`flex h-10 w-10 items-center justify-center rounded-lg transition-colors ${
            isPlusActive
              ? 'bg-[#D6EDE2] hover:bg-[#C6DDD2]'
              : 'bg-[#E5E5E0] hover:bg-[#D5D5D0]'
          }`}
          aria-label="Product toevoegen"
        >
          <Image
            src="/product_toevoegen_icon.svg"
            alt="Product toevoegen"
            width={20}
            height={20}
            className="object-contain"
          />
        </button>
      </div>
    </header>
  );
}
