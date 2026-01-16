'use client';

import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import ScanningArea from './ScanningArea';

interface ScannerViewProps {
  onScanSuccess: (barcode: string) => void;
  onError?: (error: string) => void;
}

export default function ScannerView({ onScanSuccess, onError }: ScannerViewProps) {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const startScanning = async () => {
      try {
        const html5QrCode = new Html5Qrcode('scanner-container');
        scannerRef.current = html5QrCode;

        await html5QrCode.start(
          { facingMode: 'environment' }, // Use back camera
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
            aspectRatio: 1.0,
          },
          (decodedText) => {
            // Success callback
            onScanSuccess(decodedText);
            stopScanning();
          },
          (errorMessage) => {
            // Error callback - ignore most errors as they're just "no QR code found"
            if (errorMessage.includes('No QR code')) {
              return;
            }
            if (onError) {
              onError(errorMessage);
            }
          }
        );

        setIsScanning(true);
        setError(null);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to start camera';
        setError(errorMessage);
        setIsScanning(false);
        if (onError) {
          onError(errorMessage);
        }
      }
    };

    startScanning();

    return () => {
      stopScanning();
    };
  }, [onScanSuccess, onError]);

  const stopScanning = async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
      } catch (err) {
        // Ignore errors if scanner is already stopped or not running
        const errorMessage = err instanceof Error ? err.message : String(err);
        if (
          !errorMessage.includes('not running') &&
          !errorMessage.includes('not started') &&
          !errorMessage.includes('Cannot stop')
        ) {
          console.error('Error stopping scanner:', err);
        }
      } finally {
        try {
          scannerRef.current.clear();
        } catch (err) {
          // Ignore clear errors
        }
        scannerRef.current = null;
        setIsScanning(false);
      }
    }
  };

  return (
    <div className="relative flex h-full w-full flex-col items-center justify-center">
      {/* Camera container */}
      <div
        id="scanner-container"
        className="relative h-full w-full overflow-hidden"
      />

      {/* Dark overlay with scanning area cutout */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        {/* Top overlay */}
        <div className="absolute top-0 left-0 right-0 bg-black/60" style={{ height: 'calc(50% - 125px)' }} />
        {/* Bottom overlay */}
        <div className="absolute bottom-0 left-0 right-0 bg-black/60" style={{ height: 'calc(50% - 125px)' }} />
        {/* Left overlay */}
        <div className="absolute left-0 bg-black/60" style={{ width: 'calc(50% - 125px)', top: 'calc(50% - 125px)', bottom: 'calc(50% - 125px)' }} />
        {/* Right overlay */}
        <div className="absolute right-0 bg-black/60" style={{ width: 'calc(50% - 125px)', top: 'calc(50% - 125px)', bottom: 'calc(50% - 125px)' }} />
      </div>

      {/* Scanning area overlay */}
      <ScanningArea width={250} height={250} />

      {/* Error message */}
      {error && (
        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 rounded-lg bg-red-500 px-4 py-2 text-white z-20">
          {error}
        </div>
      )}

      {/* Instruction text */}
      <p className="absolute bottom-8 left-1/2 -translate-x-1/2 text-center text-base text-white z-20">
        Scan de QR code of Barcode
      </p>
    </div>
  );
}
