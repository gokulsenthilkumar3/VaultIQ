'use client';

import React from 'react';
import QRScanner from '../../components/QRScanner';
import { useRouter } from 'next/navigation';
import { apiFetch } from '../../lib/api';

export default function ScannerPage() {
  const router = useRouter();

  const [scanError, setScanError] = React.useState<string | null>(null);

  const handleScan = async (data: string) => {
    try {
      setScanError(null);
      const asset = await apiFetch(`/assets/${data}`);
      if (asset && asset.id) {
        router.push(`/inventory/${asset.id}`);
      } else {
        setScanError('Asset not found. Check the QR code and try again.');
      }
    } catch {
      setScanError('Asset not found. Check the QR code and try again.');
    }
  };

  return (
    <div className="scanner-container">
      <header>
        <h1 className="page-title">Hardware Scanner</h1>
        <p className="page-subtitle">Scan QR codes to instantly check-in, check-out, or view asset vitals.</p>
      </header>

      <div className="scanner-main card glass">
        <div className="scanner-viewport">
          <QRScanner onScanSuccess={handleScan} />
        </div>
        
          <div className="scanner-instructions">
            <h3>Instructions</h3>
            <ul>
              <li>Position the asset QR code within the frame.</li>
              <li>Ensure adequate lighting for optical recognition.</li>
              <li>VaultIQ will automatically redirect to the asset lifecycle page.</li>
            </ul>
            {scanError && (
              <div className="error-toast glass animate-fade-in">
                <strong>Error:</strong> {scanError}
              </div>
            )}
          </div>
      </div>

      <style jsx>{`
        .error-toast {
          margin-top: 20px;
          padding: 16px;
          background: rgba(218, 54, 51, 0.1);
          color: var(--accent-danger);
          border: 1px solid rgba(218, 54, 51, 0.2);
          border-radius: 8px;
        }
        .scanner-container {
          display: flex;
          flex-direction: column;
          gap: 40px;
        }

        .scanner-main {
          display: grid;
          grid-template-columns: 1.5fr 1fr;
          gap: 40px;
          padding: 40px;
          min-height: 500px;
        }

        .scanner-viewport {
          background: black;
          border-radius: 16px;
          overflow: hidden;
          border: 1px solid var(--border-color);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .scanner-instructions {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .scanner-instructions h3 {
          font-size: 1.5rem;
          font-weight: 700;
        }

        .scanner-instructions ul {
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .scanner-instructions li {
          color: var(--text-secondary);
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .scanner-instructions li::before {
          content: '•';
          color: var(--accent-primary);
          font-size: 1.5rem;
        }
      `}</style>
    </div>
  );
}
