'use client';

import React from 'react';
import QRScanner from '../../components/QRScanner';

export default function ScannerPage() {
  return (
    <div className="scanner-container">
      <header>
        <h1 className="page-title">Hardware Scanner</h1>
        <p className="page-subtitle">Scan QR codes to instantly check-in, check-out, or view asset vitals.</p>
      </header>

      <div className="scanner-main card glass">
        <div className="scanner-viewport">
          <QRScanner onScanSuccess={(data: string) => console.log('Scanned:', data)} />
        </div>
        
        <div className="scanner-instructions">
          <h3>Instructions</h3>
          <ul>
            <li>Position the asset QR code within the frame.</li>
            <li>Ensure adequate lighting for optical recognition.</li>
            <li>VaultIQ will automatically redirect to the asset lifecycle page.</li>
          </ul>
        </div>
      </div>

      <style jsx>{`
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
