'use client';

import React from 'react';
import { useAuth } from '../context/AuthContext';
import { usePathname } from 'next/navigation';

import RoleGuard from './RoleGuard';

export default function Shell({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
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
          <div className="avatar">{user.fullName.substring(0, 2).toUpperCase()}</div>
          <div className="user-info">
            <p className="user-name">{user.fullName}</p>
            <p className="user-role">{user.role}</p>
          </div>
        </div>
      </aside>
      
      <main className="main-content">
        <header className="top-bar">
          <div className="search-box">
            <input type="text" placeholder="Search assets, tags, users..." className="glass" />
          </div>
          <div className="actions">
            <RoleGuard roles={['ADMIN']}>
              <button className="btn btn-primary">+ Add Asset</button>
            </RoleGuard>
          </div>
        </header>
        <div className="content-area animate-fade-in">
          {children}
        </div>
      </main>
    </div>
  );
}
