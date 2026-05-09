'use client';

import React, { useState } from 'react';
import useSWR from 'swr';
import { apiFetch } from '../lib/api';

interface CheckoutModalProps {
  asset: any;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CheckoutModal({ asset, onClose, onSuccess }: CheckoutModalProps) {
  const { data: users } = useSWR('/users', apiFetch);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCheckout = async () => {
    if (!selectedUserId) return;
    setIsSubmitting(true);
    try {
      await apiFetch(`/assets/${asset.id}/checkout`, {
        method: 'POST',
        body: JSON.stringify({ 
          userId: selectedUserId,
          signature: 'MOCK_SIGNATURE_DATA' // In production, this would be from a signature pad
        }),
      });
      onSuccess();
      onClose();
    } catch (err) {
      console.error(err);
      alert('Checkout failed. Please check system logs.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content card glass animate-slide-up" onClick={e => e.stopPropagation()}>
        <header className="modal-header">
          <h2>Deploy Asset</h2>
          <p>Assigning <strong>{asset.modelName}</strong> to personnel.</p>
        </header>

        <div className="modal-body">
          <div className="input-group">
            <label htmlFor="personnel-select">Select Personnel</label>
            <select 
              id="personnel-select"
              aria-label="Select employee for asset assignment"
              value={selectedUserId} 
              onChange={e => setSelectedUserId(e.target.value)}
              className="glass"
            >
              <option value="">Choose an employee...</option>
              {users?.map((user: any) => (
                <option key={user.id} value={user.id}>{user.fullName} ({user.email})</option>
              ))}
            </select>
          </div>

          <div className="compliance-notice">
            <p>⚠️ This deployment will be recorded on the blockchain audit trail. Digital signature will be anchored to SHA-256 block hash.</p>
          </div>
        </div>

        <footer className="modal-footer">
          <button className="btn btn-outline" onClick={onClose}>Cancel</button>
          <button 
            className="btn btn-primary" 
            onClick={handleCheckout} 
            disabled={!selectedUserId || isSubmitting}
          >
            {isSubmitting ? 'Recording...' : 'Confirm Deployment'}
          </button>
        </footer>
      </div>

      <style jsx>{`
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.8);
          backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 2000;
        }

        .modal-content {
          width: 500px;
          padding: 40px;
          display: flex;
          flex-direction: column;
          gap: 32px;
        }

        .modal-header h2 { font-size: 1.5rem; font-weight: 800; margin-bottom: 8px; }
        .modal-header p { color: var(--text-secondary); font-size: 0.9rem; }

        .modal-body { display: flex; flex-direction: column; gap: 24px; }

        .input-group { display: flex; flex-direction: column; gap: 8px; }
        .input-group label { font-size: 0.8rem; font-weight: 700; color: var(--text-secondary); }
        .input-group select { padding: 12px; border: 1px solid var(--border-color); color: white; border-radius: 8px; outline: none; }

        .compliance-notice {
          padding: 16px;
          background: rgba(210, 153, 34, 0.05);
          border: 1px solid rgba(210, 153, 34, 0.2);
          border-radius: 8px;
          font-size: 0.8rem;
          color: var(--accent-warning);
          line-height: 1.4;
        }

        .modal-footer { display: flex; justify-content: flex-end; gap: 16px; }

        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-slide-up { animation: slideUp 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
      `}</style>
    </div>
  );
}
