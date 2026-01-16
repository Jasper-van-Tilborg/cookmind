'use client';

import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';

interface ScannerViewProps {
  onScanSuccess: (barcode: string) => void;
  onError?: (error: string) => void;
}

export default function ScannerView({ onScanSuccess, onError }: ScannerViewProps) {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const callbacksRef = useRef({ onScanSuccess, onError });
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Update callbacks ref when they change
  useEffect(() => {
    callbacksRef.current = { onScanSuccess, onError };
  }, [onScanSuccess, onError]);

  useEffect(() => {
    let isMounted = true;
    let scannerInstance: Html5Qrcode | null = null;
    let isStarting = false;
    let isStopped = false;

    const startScanning = async () => {
      try {
        // Check if container exists
        const container = document.getElementById('scanner-container');
        if (!container || !isMounted) {
          return;
        }

        isStarting = true;
        const html5QrCode = new Html5Qrcode('scanner-container');
        scannerInstance = html5QrCode;
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
            if (isMounted && !isStopped) {
              callbacksRef.current.onScanSuccess(decodedText);
              stopScanning();
            }
          },
          (errorMessage) => {
            // Error callback - ignore most errors as they're just "no QR code found"
            if (errorMessage.includes('No QR code')) {
              return;
            }
            if (callbacksRef.current.onError && isMounted && !isStopped) {
              callbacksRef.current.onError(errorMessage);
            }
          }
        );

        isStarting = false;
        if (isMounted && !isStopped) {
          setIsScanning(true);
          setError(null);
        }
      } catch (err) {
        isStarting = false;
        const errorMessage = err instanceof Error ? err.message : 'Failed to start camera';
        if (isMounted && !isStopped) {
          setError(errorMessage);
          setIsScanning(false);
          if (callbacksRef.current.onError) {
            callbacksRef.current.onError(errorMessage);
          }
        }
        // Clean up if start failed
        if (scannerInstance) {
          try {
            scannerInstance.clear();
          } catch {
            // Ignore
          }
          scannerInstance = null;
          scannerRef.current = null;
        }
      }
    };

    startScanning();

    return () => {
      isMounted = false;
      isStopped = true;
      
      // Cleanup scanner
      const cleanup = async () => {
        if (scannerInstance) {
          const scanner = scannerInstance;
          scannerInstance = null;
          scannerRef.current = null;
          
          try {
            // Try to get state - if it throws, scanner is not initialized
            try {
              const state = scanner.getState();
              // State 1 = SCANNING, State 2 = PAUSED
              if (state === 1 || state === 2) {
                // Stop scanner and wait for it to complete
                await scanner.stop();
                // Small delay to let media stream fully stop
                await new Promise(resolve => setTimeout(resolve, 100));
              }
            } catch (stateError) {
              // getState() failed - scanner is not initialized or already stopped
              // This is fine, just continue to clear
            }
          } catch (err) {
            // Ignore stop errors including AbortError
            const errorMessage = err instanceof Error ? err.message : String(err);
            if (!errorMessage.includes('AbortError') && !errorMessage.includes('interrupted')) {
              // Only log non-abort errors
            }
          } finally {
            try {
              scanner.clear();
            } catch {
              // Ignore clear errors
            }
          }
        }
      };

      // Wait a bit if scanner is still starting to let it initialize
      if (isStarting) {
        setTimeout(() => {
          cleanup();
        }, 300);
      } else {
        cleanup();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

  const stopScanning = async () => {
    if (scannerRef.current) {
      const scanner = scannerRef.current;
      scannerRef.current = null; // Clear ref first to prevent multiple stops
      
      try {
        // Check if scanner is actually running before trying to stop
        try {
          const state = scanner.getState();
          // State 1 = SCANNING, State 2 = PAUSED
          if (state === 1 || state === 2) {
            await scanner.stop();
          }
        } catch (stateError) {
          // getState() failed - scanner is not initialized or already stopped
          // This is fine, just continue to clear
        }
      } catch (err) {
        // Ignore errors if scanner is already stopped or not running
        const errorMessage = err instanceof Error ? err.message : String(err);
        if (
          !errorMessage.includes('not running') &&
          !errorMessage.includes('not started') &&
          !errorMessage.includes('Cannot stop') &&
          !errorMessage.includes('removeChild') &&
          !errorMessage.includes('AbortError')
        ) {
          // Only log unexpected errors
        }
      } finally {
        try {
          scanner.clear();
        } catch (err) {
          // Ignore clear errors - DOM might already be cleaned up
        }
        setIsScanning(false);
      }
    }
  };

  return (
    <div className="flex h-full w-full flex-col items-center justify-center bg-[#2B2B2B]">
      {/* Camera container - html5-qrcode will render its default UI here */}
      <div
        id="scanner-container"
        className="h-full w-full"
      />

      {/* Error message */}
      {error && (
        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 rounded-lg bg-red-500 px-4 py-2 text-white z-20">
          {error}
        </div>
      )}
    </div>
  );
}
