'use client';

import React from 'react';
import { mutate } from 'swr';
import { useAuth } from '../context/AuthContext';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  ScanQrCode,
  Wrench,
  ClipboardList,
  LogOut,
  Plus,
  Triangle
} from 'lucide-react';
import RoleGuard from './RoleGuard';
import AddAssetModal from './AddAssetModal';

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
  { href: '/inventory', label: 'Inventory', icon: <Package size={18} /> },
  { href: '/scanner', label: 'Scanner', icon: <ScanQrCode size={18} /> },
  { href: '/maintenance', label: 'Maintenance', icon: <Wrench size={18} /> },
  { href: '/reports', label: 'Reports', icon: <ClipboardList size={18} /> },
];

export default function Shell({ children }: { children: React.ReactNode }) {
  const { user, loading, logout } = useAuth();
  const [isAddAssetOpen, setIsAddAssetOpen] = React.useState(false);
  const pathname = usePathname();
  const router = useRouter();

  // Normalize path by stripping trailing slash for comparisons
  const normalizedPath = pathname.replace(/\/$/, '') || '/';

  React.useEffect(() => {
    if (!loading && !user && normalizedPath !== '/login') {
      router.replace('/login');
    }
  }, [loading, user, normalizedPath, router]);

  if (normalizedPath === '/login') return <>{children}</>;

  if (loading || !user) {
    return (
      <>
        <style>{`.shell-loader{display:flex;align-items:center;justify-content:center;min-height:100vh;background:var(--bg-primary)}.spinner{width:40px;height:40px;border:3px solid var(--border-color);border-top-color:var(--accent-primary);border-radius:50%;animation:spin 0.8s linear infinite}@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        <div className="shell-loader"><div className="spinner" /></div>
      </>
    );
  }

  const initials = (user.fullName || 'U')
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <>
      <div className="app-layout">
        <nav className="sidebar">
          <div className="logo">
            <span className="logo-icon"><Triangle size={22} fill="currentColor" /></span>
            <span>VaultIQ</span>
          </div>
          <ul className="nav-list">
            {NAV_ITEMS.map((item) => (
              <li key={item.href}>
                <a
                  href={item.href}
                  className={`nav-item ${normalizedPath === item.href ? 'active' : ''}`}
                >
                  <span className="nav-icon">{item.icon}</span>
                  <span>{item.label}</span>
                </a>
              </li>
            ))}
          </ul>
          <div className="user-profile">
            <div className="user-profile-main">
              <div className="avatar">{initials}</div>
              <div>
                <div className="user-name">{user.fullName}</div>
                <div className="user-role">{user.role}</div>
              </div>
            </div>
            <button className="btn-logout" onClick={() => logout()} aria-label="Sign out">
              <LogOut size={14} /> Sign out
            </button>
          </div>
        </nav>
        <main className="main-content">
          <RoleGuard roles={['ADMIN', 'MANAGER']}>
            <button
              className="btn btn-primary fab-add"
              onClick={() => setIsAddAssetOpen(true)}
              aria-label="Add new asset"
            >
              <Plus size={16} /> Add Asset
            </button>
          </RoleGuard>
          {children}
        </main>
      </div>
      {isAddAssetOpen && (
        <AddAssetModal
          onClose={() => setIsAddAssetOpen(false)}
          onSuccess={() => {
            setIsAddAssetOpen(false);
            mutate('/assets');
            mutate('/assets/summary');
          }}
        />
      )}
      <style>{`
        .nav-icon { font-size: 1rem; display: flex; align-items: center; }
        .logo-icon { color: var(--accent-primary); display: flex; align-items: center; }
        .btn-primary { display: flex; align-items: center; gap: 8px; }
        .user-profile { display: flex; flex-direction: column; gap: 12px; margin-top: auto; padding-top: 24px; border-top: 1px solid var(--border-color); }
        .user-profile-main { display: flex; align-items: center; gap: 12px; }
        .btn-logout { background: rgba(255,77,77,0.1); color: #ff7b78; border: 1px solid rgba(255,77,77,0.2); padding: 8px 12px; border-radius: 6px; font-size: 0.8rem; font-weight: 600; cursor: pointer; transition: background 0.2s; width: 100%; display: flex; align-items: center; justify-content: center; gap: 8px; }
        .btn-logout:hover { background: rgba(255,77,77,0.2); }
      `}</style>
    </>
  );
}
