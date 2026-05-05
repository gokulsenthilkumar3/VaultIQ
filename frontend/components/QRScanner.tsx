'use client';

import { useEffect, useRef, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';

interface ScannerProps {
  onScanSuccess: (decodedText: string) => void;
}

/**
 * High-performance QR/Barcode Scanner component for the web.
 * Uses the camera-based html5-qrcode library.
 */
export default function AssetScanner({ onScanSuccess }: ScannerProps) {
  const [error, setError] = useState<string | null>(null);
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  useEffect(() => {
    // Initialize scanner on mount
    scannerRef.current = new Html5QrcodeScanner(
      "qr-reader",
      { 
        fps: 10, 
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0 
      },
      /* verbose= */ false
    );

    scannerRef.current.render(
      (decodedText: string) => {
        // Success callback
        onScanSuccess(decodedText);
        // Optionally stop scanning after first success
        // scannerRef.current?.clear();
      },
      (errorMessage: string) => {
        // We don't necessarily want to alert on every scan failure (which happens every frame)
        // console.warn(errorMessage);
      }
    );

    // Cleanup on unmount
    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch((err: any) => console.error("Failed to clear scanner", err));
      }
    };
  }, [onScanSuccess]);

  return (
    <div className="scanner-container">
      <div id="qr-reader"></div>
      {error && <p className="error-text">{error}</p>}
      
      <style jsx>{`
        .scanner-container {
          padding: 2rem;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 16px;
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
        #qr-reader {
          width: 100%;
          max-width: 500px;
          margin: 0 auto;
        }
        .error-text {
          color: #ff4d4d;
          text-align: center;
          margin-top: 1rem;
        }
      `}</style>
    </div>
  );
}
