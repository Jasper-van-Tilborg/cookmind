'use client';

import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { X, AlertCircle } from 'lucide-react';
import { barcodeAPI } from '@/src/lib/barcode';
import { InventoryItem } from '@/src/types';

interface BarcodeScannerProps {
  isOpen: boolean;
  onClose: () => void;
  onScanSuccess: (item: Omit<InventoryItem, 'id'>) => void;
}

export default function BarcodeScanner({
  isOpen,
  onClose,
  onScanSuccess,
}: BarcodeScannerProps) {
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

      await html5QrCode.start(
        { facingMode: 'environment' }, // Back camera
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
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
      // Lookup product via API
      const product = await barcodeAPI.lookupProduct(barcode);

      if (product) {
        // Product gevonden, voeg toe aan inventory
        onScanSuccess({
          name: product.name,
          category: product.category,
          quantity: 1,
        });
        onClose();
      } else {
        // Product niet gevonden, toon error en vraag om handmatig toe te voegen
        setError(
          `Product met barcode ${barcode} niet gevonden. Voeg het handmatig toe.`
        );
        setTimeout(() => {
          onClose();
        }, 3000);
      }
    } catch (err) {
      console.error('Error processing barcode:', err);
      setError('Fout bij het verwerken van de barcode. Probeer opnieuw.');
    } finally {
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
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* Header */}
      <div className="bg-black/80 text-white p-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Scan Barcode</h2>
        <button
          onClick={handleClose}
          className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          aria-label="Sluiten"
        >
          <X size={24} />
        </button>
      </div>

      {/* Scanner */}
      <div className="flex-1 relative flex items-center justify-center bg-black">
        <div id={scannerId} className="w-full h-full" />
        
        {!scanning && !loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <div className="text-center text-white p-6">
              {error ? (
                <>
                  <AlertCircle className="mx-auto mb-4" size={48} />
                  <p className="mb-4">{error}</p>
                  <button
                    onClick={startScanner}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                  >
                    Opnieuw proberen
                  </button>
                </>
              ) : (
                <p>Camera wordt gestart...</p>
              )}
            </div>
          </div>
        )}

        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <div className="text-center text-white">
              <p>Product opzoeken...</p>
            </div>
          </div>
        )}

        {/* Scanning overlay */}
        {scanning && (
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <div className="w-64 h-64 border-2 border-purple-500 rounded-lg" />
            </div>
            <p className="absolute bottom-20 left-0 right-0 text-center text-white text-sm">
              Richt de camera op de barcode
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

