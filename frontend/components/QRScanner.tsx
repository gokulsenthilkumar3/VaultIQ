'use client';

import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Camera, AlertCircle, ScanLine, XSquare, Upload, Image as ImageIcon, Video } from 'lucide-react';

interface ScannerProps {
  onScanSuccess: (decodedText: string) => void;
}

type ScannerState = 'IDLE' | 'LOADING' | 'SCANNING' | 'ERROR';

export default function AssetScanner({ onScanSuccess }: ScannerProps) {
  const [scannerState, setScannerState] = useState<ScannerState>('IDLE');
  const [error, setError] = useState<string | null>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const startScanner = async () => {
    setScannerState('LOADING');
    try {
      if (!scannerRef.current) {
        scannerRef.current = new Html5Qrcode("qr-reader");
      }
      
      await scannerRef.current.start(
        { facingMode: "environment" },
        { 
          fps: 10, 
          qrbox: { width: 280, height: 280 },
          aspectRatio: 1.0
        },
        (decodedText: string) => {
          onScanSuccess(decodedText);
        },
        () => {}
      );
      
      setScannerState('SCANNING');
      setError(null);
    } catch (err: any) {
      setScannerState('ERROR');
      setError(err?.message || "Camera not found or permission denied.");
    }
  };

  const stopScanner = async () => {
    if (scannerRef.current && scannerState === 'SCANNING') {
      try {
        await scannerRef.current.stop();
        setScannerState('IDLE');
      } catch (err) {
        console.error("Failed to stop scanner", err);
      }
    } else {
      setScannerState('IDLE');
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      if (!scannerRef.current) {
        scannerRef.current = new Html5Qrcode("qr-reader");
      }
      const decodedText = await scannerRef.current.scanFile(file, true);
      onScanSuccess(decodedText);
    } catch (err) {
      setError("No QR code found in the uploaded image.");
      if (scannerState !== 'SCANNING') {
        setScannerState('ERROR');
      }
    }
    
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  useEffect(() => {
    // Cleanup on unmount
    return () => {
      if (scannerRef.current && scannerRef.current.isScanning) {
        scannerRef.current.stop().catch(() => {});
      }
    };
  }, []);

  return (
    <div className="scanner-container">
      <div className="scanner-ui-wrapper glass">
        
        {/* The video feed container */}
        <div 
          id="qr-reader" 
          style={{ 
            opacity: scannerState === 'SCANNING' ? 1 : 0,
            pointerEvents: scannerState === 'SCANNING' ? 'auto' : 'none',
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            zIndex: 1
          }}
        ></div>

        {scannerState === 'IDLE' && (
          <div className="scanner-placeholder glass-panel" style={{ zIndex: 5 }}>
            <div className="status-box">
              <ScanLine size={48} className="text-accent" />
              <h3>Ready to Scan</h3>
              <p>Choose an option below to start scanning an asset QR code.</p>
              <div className="action-buttons-large">
                <button className="btn-huge primary" onClick={startScanner}>
                  <Video size={24} />
                  <span>Start Camera</span>
                </button>
                <button className="btn-huge secondary" onClick={() => fileInputRef.current?.click()}>
                  <ImageIcon size={24} />
                  <span>Upload Image</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {scannerState === 'ERROR' && (
          <div className="scanner-placeholder glass-panel" style={{ zIndex: 5 }}>
            <div className="status-box error">
              <AlertCircle size={48} />
              <h3>Action Failed</h3>
              <p>{error}</p>
              <div className="action-buttons-large mt-4">
                <button className="btn-huge primary" onClick={startScanner}>
                  <Video size={20} /> Retry Camera
                </button>
                <button className="btn-huge secondary" onClick={() => fileInputRef.current?.click()}>
                  <ImageIcon size={20} /> Upload Instead
                </button>
              </div>
            </div>
          </div>
        )}

        {scannerState === 'LOADING' && (
          <div className="scanner-placeholder glass-panel" style={{ zIndex: 5 }}>
            <div className="status-box loading">
              <Camera size={48} className="pulse-icon" />
              <h3>Initializing Camera...</h3>
              <p>Waiting for video stream</p>
            </div>
          </div>
        )}

        {scannerState === 'SCANNING' && (
          <>
            <div className="scanner-overlay">
              <div className="corner corner-tl"></div>
              <div className="corner corner-tr"></div>
              <div className="corner corner-bl"></div>
              <div className="corner corner-br"></div>
              <div className="scan-line"></div>
            </div>
            
            <div className="scanner-bottom-controls">
              <button className="control-btn cancel" onClick={stopScanner}>
                <XSquare size={20} /> Stop Camera
              </button>
              <button className="control-btn upload" onClick={() => fileInputRef.current?.click()}>
                <Upload size={20} /> Upload Image
              </button>
            </div>
          </>
        )}

        <input 
          type="file" 
          accept="image/*" 
          ref={fileInputRef} 
          style={{ display: 'none' }} 
          onChange={handleFileUpload}
        />
      </div>

      <style jsx>{`
        .scanner-container { width: 100%; display: flex; justify-content: center; }
        .scanner-ui-wrapper {
          position: relative;
          width: 100%; max-width: 500px; aspect-ratio: 1;
          border-radius: 20px; overflow: hidden;
          background: rgba(0, 0, 0, 0.4);
          border: 1px solid rgba(255,255,255,0.1);
          box-shadow: 0 10px 40px rgba(0,0,0,0.3);
          display: flex;
          flex-direction: column;
        }
        #qr-reader { width: 100%; height: 100%; }
        :global(#qr-reader video) { object-fit: cover !important; border-radius: 20px !important; }

        .scanner-placeholder {
          position: absolute; inset: 0;
          display: flex; align-items: center; justify-content: center;
          padding: 20px; text-align: center;
        }
        .status-box { display: flex; flex-direction: column; align-items: center; gap: 12px; width: 100%; }
        .status-box.error { color: #ff7b78; }
        .status-box.loading, .text-accent { color: var(--accent-primary); }
        .status-box h3 { margin: 0; font-size: 1.4rem; font-weight: 700; color: var(--text-primary); }
        .status-box p { margin: 0; font-size: 0.95rem; color: var(--text-secondary); max-width: 80%; }

        .action-buttons-large {
          display: flex; flex-direction: column; gap: 12px; margin-top: 24px; width: 80%; max-width: 300px;
        }
        .btn-huge {
          display: flex; align-items: center; justify-content: center; gap: 12px;
          padding: 16px; border-radius: 12px; border: none; font-size: 1.1rem; font-weight: 600; cursor: pointer; transition: all 0.2s;
        }
        .btn-huge.primary { background: var(--accent-primary); color: white; }
        .btn-huge.secondary { background: rgba(255,255,255,0.1); color: var(--text-primary); border: 1px solid rgba(255,255,255,0.2); }
        .btn-huge:hover { transform: translateY(-2px); opacity: 0.9; }

        .mt-4 { margin-top: 1rem; }

        .scanner-bottom-controls {
          position: absolute; bottom: 20px; left: 0; right: 0;
          display: flex; justify-content: center; gap: 16px; z-index: 20;
          padding: 0 20px;
        }
        .control-btn {
          display: flex; align-items: center; gap: 8px;
          padding: 12px 20px; border-radius: 30px; font-weight: 600; font-size: 0.95rem;
          cursor: pointer; border: none; transition: all 0.2s;
          backdrop-filter: blur(10px);
        }
        .control-btn.cancel { background: rgba(255, 77, 77, 0.9); color: white; }
        .control-btn.cancel:hover { background: rgba(255, 77, 77, 1); transform: scale(1.05); }
        .control-btn.upload { background: rgba(0, 0, 0, 0.7); color: white; border: 1px solid rgba(255,255,255,0.3); }
        .control-btn.upload:hover { background: rgba(0, 0, 0, 0.9); transform: scale(1.05); }

        .pulse-icon { animation: pulse 1.5s infinite; }
        @keyframes pulse { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.5; transform: scale(0.95); } }

        .scanner-overlay { position: absolute; inset: 0; pointer-events: none; z-index: 10; }
        .corner { position: absolute; width: 40px; height: 40px; border: 3px solid var(--accent-primary); }
        .corner-tl { top: 30px; left: 30px; border-right: none; border-bottom: none; border-top-left-radius: 12px; }
        .corner-tr { top: 30px; right: 30px; border-left: none; border-bottom: none; border-top-right-radius: 12px; }
        .corner-bl { bottom: 90px; left: 30px; border-right: none; border-top: none; border-bottom-left-radius: 12px; }
        .corner-br { bottom: 90px; right: 30px; border-left: none; border-top: none; border-bottom-right-radius: 12px; }
        .scan-line {
          position: absolute; top: 30px; left: 30px; right: 30px; height: 2px;
          background: var(--accent-primary); box-shadow: 0 0 10px var(--accent-primary), 0 0 20px var(--accent-primary);
          animation: scan 2s linear infinite;
        }
        @keyframes scan { 0% { top: 30px; opacity: 0; } 10% { opacity: 1; } 90% { opacity: 1; } 100% { top: calc(100% - 92px); opacity: 0; } }
      `}</style>
    </div>
  );
}
