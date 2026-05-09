'use client';

import React from 'react';
import { useAuth } from '../context/AuthContext';
import { usePathname, useRouter } from 'next/navigation';
import RoleGuard from './RoleGuard';
import AddAssetModal from './AddAssetModal';

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard', icon: '📊' },
  { href: '/inventory', label: 'Inventory', icon: '📦' },
  { href: '/scanner', label: 'Scanner', icon: '📷' },
  { href: '/maintenance', label: 'Maintenance', icon: '🔧' },
  { href: '/reports', label: 'Reports', icon: '📜' },
];

export default function Shell({ children }: { children: React.ReactNode }) {
  const { user, loading, logout } = useAuth();
  const [isAddAssetOpen, setIsAddAssetOpen] = React.useState(false);
  const pathname = usePathname();
  const router = useRouter();

  React.useEffect(() => {
    if (!loading && !user && pathname !== '/login') {
      router.replace('/login');
    }
  }, [loading, user, pathname, router]);

  if (pathname === '/login') return <>{children}</>;

  if (loading || !user) {
    return (
      <div className="shell-loader">
        <div className="spinner" aria-label="Loading"></div>
        <style jsx>{`.shell-loader{display:flex;align-items:center;justify-content:center;min-height:100vh;background:var(--bg-primary)}.spinner{width:40px;height:40px;border:3px solid var(--border-color);border-top-color:var(--accent-primary);border-radius:50%;animation:spin 0.8s linear infinite}@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }

  const initials = (user.fullName || 'U')
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <div className="layout-wrapper">
      <aside className="sidebar glass">
        <div className="logo">
          <span className="logo-icon">▲</span>
          <span className="logo-text">VaultIQ</span>
        </div>
        <nav className="nav-menu" aria-label="Main navigation">
          {NAV_ITEMS.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className={`nav-item ${pathname === item.href ? 'active' : ''}`}
              aria-current={pathname === item.href ? 'page' : undefined}
            >
              <span className="nav-icon">{item.icon}</span>
              {item.label}
            </a>
          ))}
        </nav>
        <div className="user-profile">
          <div className="user-profile-main">
            <div className="avatar" aria-hidden="true">{initials}</div>
            <div className="user-info">
              <p className="user-name">{user.fullName}</p>
              <p className="user-role">{user.role}</p>
            </div>
          </div>
          <button className="btn-logout" onClick={() => logout()} aria-label="Sign out">
            Sign out
          </button>
        </div>
      </aside>

      <main className="main-content">
        <header className="top-bar">
          <div className="top-bar-spacer"></div>
          <div className="actions">
            <RoleGuard roles={['ADMIN', 'MANAGER']}>
              <button
                className="btn btn-primary"
                onClick={() => setIsAddAssetOpen(true)}
                aria-label="Add new asset"
              >
                + Add Asset
              </button>
            </RoleGuard>
          </div>
        </header>

        <div className="content-area animate-fade-in">{children}</div>
      </main>

      {isAddAssetOpen && (
        <AddAssetModal
          onClose={() => setIsAddAssetOpen(false)}
          onSuccess={() => {
            setIsAddAssetOpen(false);
            window.location.reload();
          }}
        />
      )}

      <style jsx>{`
        .nav-icon { font-size: 1rem; }
        .user-profile {
          display: flex; flex-direction: column; gap: 12px;
          margin-top: auto; padding-top: 24px;
          border-top: 1px solid var(--border-color);
        }
        .user-profile-main { display: flex; align-items: center; gap: 12px; }
        .btn-logout {
          background: rgba(255,77,77,0.1);
          color: #ff7b78;
          border: 1px solid rgba(255,77,77,0.2);
          padding: 8px 12px;
          border-radius: 6px;
          font-size: 0.8rem;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.2s;
          width: 100%;
        }
        .btn-logout:hover { background: rgba(255,77,77,0.2); }
      `}</style>
    </div>
  );
}
