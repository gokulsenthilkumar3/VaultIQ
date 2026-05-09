'use client';

import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setError(null);
    setLoading(true);
    try {
      await login(email.trim());
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your email and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card glass animate-slide-up">
        <div className="login-logo">
          <span className="logo-icon">▲</span>
          <span>VaultIQ</span>
        </div>
        <h1>Sign in</h1>
        <p className="login-subtitle">Enter your corporate email to access the asset management platform.</p>

        {error && (
          <div className="error-banner" role="alert">
            <span>⚠️</span> {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label htmlFor="email">Email address</label>
            <input
              id="email"
              type="email"
              required
              autoFocus
              placeholder="you@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              aria-label="Corporate email address"
            />
          </div>
          <button type="submit" className="btn btn-primary login-btn" disabled={loading}>
            {loading ? 'Signing in…' : 'Continue with Email'}
          </button>
        </form>

        <p className="dev-hint">
          Dev hint: use <code>admin@company.com</code> for ADMIN role
        </p>
      </div>

      <style jsx>{`
        .login-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--bg-primary);
        }
        .login-card {
          width: 420px;
          padding: 48px;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        .login-logo {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 1.4rem;
          font-weight: 800;
          color: var(--accent-primary);
          margin-bottom: 8px;
        }
        .logo-icon { font-size: 1.6rem; }
        h1 { font-size: 1.8rem; font-weight: 800; }
        .login-subtitle { color: var(--text-secondary); font-size: 0.9rem; }
        .input-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin-bottom: 8px;
        }
        .input-group label {
          font-size: 0.8rem;
          font-weight: 700;
          color: var(--text-secondary);
        }
        .input-group input {
          background: rgba(255,255,255,0.05);
          border: 1px solid var(--border-color);
          border-radius: 8px;
          padding: 12px 16px;
          color: var(--text-primary);
          font-size: 1rem;
          outline: none;
          transition: border-color 0.2s;
        }
        .input-group input:focus {
          border-color: var(--accent-primary);
          box-shadow: 0 0 0 3px rgba(88, 166, 255, 0.15);
        }
        .login-btn {
          width: 100%;
          padding: 14px;
          font-size: 1rem;
          margin-top: 8px;
        }
        .error-banner {
          background: rgba(218, 54, 51, 0.12);
          border: 1px solid rgba(218, 54, 51, 0.3);
          border-radius: 8px;
          padding: 12px 16px;
          color: #ff7b78;
          font-size: 0.875rem;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .dev-hint {
          font-size: 0.75rem;
          color: var(--text-muted);
          text-align: center;
          margin-top: 8px;
        }
        .dev-hint code {
          color: var(--accent-primary);
          background: rgba(88, 166, 255, 0.08);
          padding: 2px 6px;
          border-radius: 4px;
        }
      `}</style>
    </div>
  );
}
