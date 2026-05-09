'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="error-container card glass">
      <div className="error-icon">⚠️</div>
      <h2>System Interruption</h2>
      <p>VaultIQ encountered an unexpected runtime error. Our diagnostic engine has been notified.</p>
      <button className="btn btn-primary" onClick={() => reset()}>
        Reinitialize Module
      </button>

      <style jsx>{`
        .error-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          max-width: 500px;
          margin: 100px auto;
          text-align: center;
          padding: 48px;
        }
        
        .error-icon {
          font-size: 3rem;
          margin-bottom: 24px;
        }
        
        h2 {
          margin-bottom: 16px;
          font-weight: 800;
        }
        
        p {
          color: var(--text-secondary);
          margin-bottom: 32px;
        }
      `}</style>
    </div>
  );
}
