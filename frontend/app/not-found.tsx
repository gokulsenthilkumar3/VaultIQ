'use client';

import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="not-found-container card glass">
      <div className="glitch-text">404</div>
      <h2>Asset Not Found</h2>
      <p>The operational route you are attempting to access does not exist or has been decommissioned.</p>
      <Link href="/dashboard" className="btn btn-primary">
        Return to Dashboard
      </Link>

      <style jsx>{`
        .not-found-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          max-width: 500px;
          margin: 100px auto;
          text-align: center;
          padding: 48px;
        }
        
        .glitch-text {
          font-size: 5rem;
          font-weight: 900;
          color: var(--accent-primary);
          margin-bottom: 8px;
          letter-spacing: -4px;
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
