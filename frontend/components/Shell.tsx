'use client';

import React from 'react';
import { useAuth } from '../context/AuthContext';
import { usePathname } from 'next/navigation';

import RoleGuard from './RoleGuard';
import AddAssetModal from './AddAssetModal';

export default function Shell({ children }: { children: React.ReactNode }) {
  const { user, loading, logout } = useAuth();
  const [isAddAssetOpen, setIsAddAssetOpen] = React.useState(false);
  const pathname = usePathname();

  if (loading) return null; // Or a global loader
  if (pathname === '/login') return <>{children}</>;
  if (!user) return null; // Middleware will handle redirect

  return (
    <div className="layout-wrapper">
      <aside className="sidebar glass">
        <div className="logo">
          <span className="logo-icon">▲</span>
          <span className="logo-text">AssetFlow</span>
        </div>
        <nav className="nav-menu">
          <a href="/dashboard" className={`nav-item ${pathname === '/dashboard' ? 'active' : ''}`}>Dashboard</a>
          <a href="/inventory" className={`nav-item ${pathname === '/inventory' ? 'active' : ''}`}>Inventory</a>
          <a href="/scanner" className={`nav-item ${pathname === '/scanner' ? 'active' : ''}`}>Scanner</a>
          <a href="/maintenance" className={`nav-item ${pathname === '/maintenance' ? 'active' : ''}`}>Maintenance</a>
          <a href="/reports" className={`nav-item ${pathname === '/reports' ? 'active' : ''}`}>Reports</a>
        </nav>
        <div className="user-profile">
          <div className="user-profile-main">
            <div className="avatar">{(user?.fullName || '??').substring(0, 2).toUpperCase()}</div>
            <div className="user-info">
              <p className="user-name">{user?.fullName || 'Anonymous'}</p>
              <p className="user-role">{user?.role || 'User'}</p>
            </div>
          </div>
          <button className="btn-logout" onClick={() => logout()}>Logout</button>
        </div>
      </aside>
      
      <main className="main-content">
        <header className="top-bar">
          <div className="search-box">
            <input type="text" placeholder="Search assets, tags, users..." className="glass" />
          </div>
          <div className="actions">
            <RoleGuard roles={['ADMIN']}>
              <button className="btn btn-primary" onClick={() => setIsAddAssetOpen(true)}>+ Add Asset</button>
            </RoleGuard>
          </div>
        </header>
        <div className="content-area animate-fade-in">
          {children}
        </div>
        {isAddAssetOpen && <AddAssetModal onClose={() => setIsAddAssetOpen(false)} onSuccess={() => window.location.reload()} />}
      </main>
      <style jsx>{`
        .user-profile {
          display: flex;
          flex-direction: column;
          gap: 16px;
          margin-top: auto;
          padding: 24px;
          border-top: 1px solid var(--border-color);
        }
        .user-profile-main {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .btn-logout {
          background: rgba(255, 77, 77, 0.1);
          color: #ff4d4d;
          border: 1px solid rgba(255, 77, 77, 0.2);
          padding: 8px;
          border-radius: 6px;
          font-size: 0.8rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }
        .btn-logout:hover {
          background: rgba(255, 77, 77, 0.2);
        }
      `}</style>
    </div>
  );
}
