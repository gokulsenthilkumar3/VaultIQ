'use client';
import React, { useState } from 'react';
import useSWR from 'swr';
import { apiFetch } from '../../lib/api';
import { Plus, Search, User } from 'lucide-react';

function AddUserModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [form, setForm] = useState({
    fullName: '', email: '', role: 'USER',
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.fullName || !form.email) {
      setError('Please fill in all required fields.');
      return;
    }
    setIsSubmitting(true);
    try {
      await apiFetch('/users', {
        method: 'POST',
        body: JSON.stringify(form)
      });
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Failed to add user');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card glass animate-slide-up" onClick={e => e.stopPropagation()}>
        <h2 className="modal-title">Add New Personnel</h2>
        {error && <div className="error-banner">{error}</div>}
        <form onSubmit={handleSubmit} className="modal-form">
          <label>Full Name
            <input className="input" value={form.fullName} onChange={e => setForm({...form, fullName: e.target.value})} placeholder="e.g. Jane Doe" required />
          </label>
          <label>Email Address
            <input className="input" type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} placeholder="jane.doe@example.com" required />
          </label>
          <label>Role
            <select className="input" value={form.role} onChange={e => setForm({...form, role: e.target.value})}>
              <option value="USER">General Staff</option>
              <option value="MANAGER">Manager</option>
              <option value="ADMIN">Administrator</option>
            </select>
          </label>
          <div className="modal-actions">
            <button type="button" className="btn btn-outline" onClick={onClose} disabled={isSubmitting}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Adding...' : 'Add Personnel'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function UsersPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [showAdd, setShowAdd] = useState(false);

  const { data: users, error, mutate } = useSWR<any[]>('/users', apiFetch);

  if (error) return <div style={{ padding: 40, color: 'var(--accent-warning)' }}>Failed to load personnel.</div>;

  const filteredUsers = users?.filter((u) => 
    u.fullName.toLowerCase().includes(searchQuery.toLowerCase()) || 
    u.email.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  return (
    <div className="users-container">
      <header className="users-header">
        <div>
          <h1 className="page-title">Personnel Management</h1>
          <p className="page-subtitle">{users?.length || 0} active team members.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowAdd(true)}>
          <Plus size={16} /> Add Personnel
        </button>
      </header>

      <div className="search-bar glass">
        <Search size={16} className="search-icon" />
        <input
          type="text"
          placeholder="Search by name or email..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
        />
      </div>

      {!users ? (
        <div>Loading...</div>
      ) : (
        <div className="user-grid">
          {filteredUsers.map((user: any) => {
            const initials = user.fullName.split(' ').map((n: string) => n[0]).slice(0, 2).join('').toUpperCase();
            return (
              <div key={user.id} className="user-card glass">
                <div className="user-avatar-wrapper">
                  <div className="user-avatar">{initials}</div>
                </div>
                <div className="user-details">
                  <div className="user-name">{user.fullName}</div>
                  <div className="user-email">{user.email}</div>
                  <span className={`user-role badge-${user.role.toLowerCase()}`}>{user.role}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showAdd && (
        <AddUserModal
          onClose={() => setShowAdd(false)}
          onSuccess={() => { setShowAdd(false); mutate(); }}
        />
      )}

      <style>{`
        .users-container { display: flex; flex-direction: column; gap: 24px; padding: 24px; }
        .users-header { display: flex; justify-content: space-between; align-items: flex-start; }
        .page-title { font-size: 1.6rem; font-weight: 800; margin: 0; }
        .page-subtitle { color: var(--text-secondary); font-size: 0.9rem; margin-top: 4px; }
        .search-bar { display: flex; align-items: center; gap: 12px; padding: 10px 16px; border-radius: 10px; }
        .search-icon { color: var(--text-secondary); flex-shrink: 0; }
        .search-bar input { background: transparent; border: none; color: var(--text-primary); outline: none; font-size: 0.9rem; width: 100%; }
        
        .user-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 20px; }
        .user-card { padding: 20px; border-radius: 12px; display: flex; align-items: center; gap: 16px; transition: transform 0.2s; }
        .user-card:hover { transform: translateY(-2px); }
        .user-avatar-wrapper { flex-shrink: 0; }
        .user-avatar { width: 50px; height: 50px; border-radius: 50%; background: rgba(88,166,255,0.15); color: var(--accent-primary); border: 2px solid rgba(88,166,255,0.3); display: flex; align-items: center; justify-content: center; font-size: 1.1rem; font-weight: 800; }
        .user-details { display: flex; flex-direction: column; gap: 4px; overflow: hidden; }
        .user-name { font-size: 1rem; font-weight: 700; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .user-email { font-size: 0.78rem; color: var(--text-secondary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .user-role { font-size: 0.65rem; font-weight: 700; padding: 3px 8px; border-radius: 6px; align-self: flex-start; margin-top: 2px; }
        .badge-admin { background: rgba(63, 185, 80, 0.15); color: #3fb950; }
        .badge-manager { background: rgba(210, 153, 34, 0.15); color: #d29922; }
        .badge-user { background: rgba(88, 166, 255, 0.15); color: #58a6ff; }

        .btn { display: flex; align-items: center; justify-content: center; gap: 6px; padding: 8px 12px; border-radius: 8px; font-size: 0.82rem; font-weight: 600; cursor: pointer; border: none; text-decoration: none; transition: opacity 0.2s, background 0.2s; }
        .btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .btn-primary { background: var(--accent-primary); color: white; }
        .btn-primary:hover:not(:disabled) { opacity: 0.9; }
        .btn-outline { background: transparent; border: 1px solid var(--border-color); color: var(--text-primary); }
        .btn-outline:hover:not(:disabled) { background: rgba(255,255,255,0.05); }

        .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.7); display: flex; align-items: center; justify-content: center; z-index: 1000; backdrop-filter: blur(4px); }
        .modal-card { padding: 32px; border-radius: 16px; width: 100%; max-width: 420px; box-shadow: 0 10px 40px rgba(0,0,0,0.3); }
        .modal-title { font-size: 1.2rem; font-weight: 700; margin: 0 0 20px; }
        .modal-form { display: flex; flex-direction: column; gap: 16px; }
        .modal-form label { display: flex; flex-direction: column; gap: 6px; font-size: 0.8rem; font-weight: 600; color: var(--text-secondary); }
        .input { background: rgba(255,255,255,0.06); border: 1px solid var(--border-color); color: var(--text-primary); padding: 10px 12px; border-radius: 8px; font-size: 0.9rem; outline: none; transition: border-color 0.2s; }
        .input:focus { border-color: var(--accent-primary); }
        .modal-actions { display: flex; justify-content: flex-end; gap: 12px; margin-top: 8px; }
        .error-banner { background: rgba(255,77,77,0.1); border: 1px solid rgba(255,77,77,0.3); color: #ff7b78; padding: 10px; border-radius: 8px; font-size: 0.85rem; margin-bottom: 16px; }

        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-slide-up { animation: slideUp 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
      `}</style>
    </div>
  );
}
