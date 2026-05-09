'use client';

import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      await login(email);
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card card glass animate-fade-in">
        <div className="login-header">
          <span className="logo-icon">▲</span>
          <h1>VaultIQ</h1>
          <p>Enterprise Asset Hub</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label htmlFor="email">Work Email</label>
            <input 
              id="email"
              type="email" 
              placeholder="name@company.com" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="glass"
            />
          </div>

          {error && <p className="error-message">{error}</p>}

          <button type="submit" className="btn btn-primary login-btn" disabled={isLoading}>
            {isLoading ? 'Authenticating...' : 'Sign in with SSO'}
          </button>
        </form>

        <p className="login-footer">
          Powered by VaultIQ Core. Secure, SHA-256 anchored sessions.
        </p>
      </div>

      <style jsx>{`
        .login-page {
          height: 100vh;
          width: 100vw;
          display: flex;
          align-items: center;
          justify-content: center;
          background: radial-gradient(circle at center, #161b22 0%, #0a0c10 100%);
        }

        .login-card {
          width: 400px;
          padding: 48px;
          display: flex;
          flex-direction: column;
          gap: 32px;
          text-align: center;
        }

        .login-header h1 {
          font-size: 2rem;
          font-weight: 900;
          margin: 8px 0;
        }

        .login-header p {
          color: var(--text-secondary);
          font-size: 0.9rem;
          letter-spacing: 1px;
          text-transform: uppercase;
        }

        .logo-icon {
          font-size: 2.5rem;
          color: var(--accent-primary);
        }

        form {
          display: flex;
          flex-direction: column;
          gap: 24px;
          text-align: left;
        }

        .input-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .input-group label {
          font-size: 0.8rem;
          font-weight: 600;
          color: var(--text-secondary);
        }

        .input-group input {
          padding: 12px 16px;
          border: 1px solid var(--border-color);
          color: white;
          border-radius: 8px;
          outline: none;
        }

        .error-message {
          color: var(--accent-danger);
          font-size: 0.85rem;
          text-align: center;
        }

        .login-btn {
          width: 100%;
          padding: 14px;
        }

        .login-footer {
          font-size: 0.7rem;
          color: var(--text-muted);
        }
      `}</style>
    </div>
  );
}
