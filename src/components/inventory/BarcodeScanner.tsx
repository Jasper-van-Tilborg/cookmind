'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Html5Qrcode } from 'html5-qrcode';
import { X, AlertCircle } from 'lucide-react';

interface BarcodeScannerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function BarcodeScanner({
  isOpen,
  onClose,
}: BarcodeScannerProps) {
  const router = useRouter();
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const scannerId = 'barcode-scanner';

  useEffect(() => {
    if (isOpen && !scannerRef.current) {
      startScanner();
    }

    return () => {
      stopScanner();
    };
  }, [isOpen]);

  const startScanner = async () => {
    try {
      setError(null);
      setScanning(true);

      const html5QrCode = new Html5Qrcode(scannerId);
      scannerRef.current = html5QrCode;

      // Calculate optimal qrbox size for mobile (80% of viewport width, max 300px)
      const viewportWidth = Math.min(window.innerWidth * 0.8, 300);
      const qrboxSize = Math.min(viewportWidth, 300);

      await html5QrCode.start(
        { facingMode: 'environment' }, // Back camera
        {
          fps: 10,
          qrbox: { width: qrboxSize, height: qrboxSize },
          aspectRatio: 1.0,
        },
        (decodedText) => {
          handleScanSuccess(decodedText);
        },
        (errorMessage) => {
          // Ignore scanning errors (just keep scanning)
        }
      );
    } catch (err: any) {
      console.error('Error starting scanner:', err);
      setError(
        err.message?.includes('Permission')
          ? 'Camera toegang geweigerd. Controleer je browser instellingen.'
          : 'Kon camera niet openen. Zorg dat je HTTPS gebruikt of localhost.'
      );
      setScanning(false);
    }
  };

  const stopScanner = async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
        await scannerRef.current.clear();
      } catch (err) {
        console.error('Error stopping scanner:', err);
      }
      scannerRef.current = null;
    }
    setScanning(false);
  };

  const handleScanSuccess = async (barcode: string) => {
    if (loading) return; // Prevent multiple calls

    setLoading(true);
    await stopScanner();

    try {
      // Navigeer naar product detail pagina
      router.push(`/inventory/product/${barcode}`);
      onClose();
    } catch (err) {
      console.error('Error processing barcode:', err);
      setError('Fout bij het verwerken van de barcode. Probeer opnieuw.');
      setLoading(false);
    }
  };

  const handleClose = async () => {
    await stopScanner();
    setError(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col safe-area-inset">
      {/* Header - Mobile optimized */}
      <div className="bg-black/90 backdrop-blur-sm text-white p-3 sm:p-4 flex items-center justify-between safe-area-top">
        <h2 className="text-base sm:text-lg font-semibold">Scan Barcode</h2>
        <button
          onClick={handleClose}
          className="p-2 active:bg-white/20 rounded-lg transition-colors touch-target"
          aria-label="Sluiten"
        >
          <X size={22} className="sm:w-6 sm:h-6" />
        </button>
      </div>

      {/* Scanner - Full screen on mobile */}
      <div className="flex-1 relative flex items-center justify-center bg-black overflow-hidden">
        <div id={scannerId} className="w-full h-full object-cover" />
        
        {!scanning && !loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm">
            <div className="text-center text-white p-4 sm:p-6 max-w-sm mx-auto">
              {error ? (
                <>
                  <AlertCircle className="mx-auto mb-3 sm:mb-4" size={40} className="sm:w-12 sm:h-12" />
                  <p className="mb-4 text-sm sm:text-base px-4">{error}</p>
                  <button
                    onClick={startScanner}
                    className="px-6 py-3 bg-purple-600 text-white rounded-lg active:bg-purple-700 transition-colors touch-target text-sm sm:text-base font-medium"
                  >
                    Opnieuw proberen
                  </button>
                </>
              ) : (
                <div className="space-y-2">
                  <div className="animate-pulse">
                    <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full mx-auto mb-3"></div>
                  </div>
                  <p className="text-sm sm:text-base">Camera wordt gestart...</p>
                </div>
              )}
            </div>
          </div>
        )}

        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm">
            <div className="text-center text-white">
              <div className="animate-spin w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full mx-auto mb-3"></div>
              <p className="text-sm sm:text-base">Product opzoeken...</p>
            </div>
          </div>
        )}

        {/* Scanning overlay - Mobile optimized */}
        {scanning && (
          <div className="absolute inset-0 pointer-events-none">
            {/* Scanning frame - Responsive size */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <div className="w-[280px] h-[280px] sm:w-64 sm:h-64 border-4 border-purple-500 rounded-xl shadow-lg">
                {/* Corner indicators */}
                <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-purple-500 rounded-tl-lg"></div>
                <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-purple-500 rounded-tr-lg"></div>
                <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-purple-500 rounded-bl-lg"></div>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-purple-500 rounded-br-lg"></div>
              </div>
            </div>
            {/* Instructions - Mobile bottom safe area */}
            <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 safe-area-bottom">
              <p className="text-center text-white text-sm sm:text-base font-medium bg-black/50 backdrop-blur-sm rounded-lg py-2 px-4">
                Richt de camera op de barcode
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

