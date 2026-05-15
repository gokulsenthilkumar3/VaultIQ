'use client';
import React from 'react';
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  ScanQrCode,
  Wrench,
  ClipboardList,
  LogOut,
  Triangle,
} from 'lucide-react';

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
  { href: '/inventory', label: 'Inventory', icon: <Package size={18} /> },
  { href: '/scanner', label: 'Scanner', icon: <ScanQrCode size={18} /> },
  { href: '/maintenance', label: 'Maintenance', icon: <Wrench size={18} /> },
  { href: '/reports', label: 'Reports', icon: <ClipboardList size={18} /> },
];

export default function Shell({ children }: { children: React.ReactNode }) {
  const { user, loading, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const normalizedPath = '/' + (pathname.replace(/^\//, '').split('/')[0] || '');

  React.useEffect(() => {
    if (!loading && !user && normalizedPath !== '/login') {
      router.replace('/login');
    }
  }, [loading, user, normalizedPath, router]);

  if (normalizedPath === '/login') return <>{children}</>;

  if (loading || !user) {
    return (
      <div className="shell-loader">
        <div className="spinner" />
        <style>{`.shell-loader{display:flex;align-items:center;justify-content:center;min-height:100vh;background:var(--bg-primary)}.spinner{width:40px;height:40px;border:3px solid var(--border-color);border-top-color:var(--accent-primary);border-radius:50%;animation:spin 0.8s linear infinite}@keyframes spin{to{transform:rotate(360deg)}}`}</style>
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
    <>
      <div className="layout-wrapper">
        <nav className="sidebar">
          <div className="logo">
            <Triangle size={22} fill="currentColor" />
            <span>VaultIQ</span>
          </div>

          <ul className="nav-menu">
            {NAV_ITEMS.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`nav-item ${
                    normalizedPath === item.href ? 'active' : ''
                  }`}
                >
                  <span className="nav-icon">{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
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
          {children}
        </main>
      </div>

      <style>{`
        ul.nav-menu { list-style: none; padding: 0; }
        .nav-item { display: flex; align-items: center; gap: 12px; padding: 11px 14px; border-radius: 8px; text-decoration: none; color: var(--text-secondary); font-weight: 500; font-size: 0.9rem; transition: all 0.2s ease; }
        .nav-item:hover { background: rgba(88,166,255,0.08); color: var(--text-primary); }
        .nav-item.active { background: rgba(88,166,255,0.12); color: var(--accent-primary); font-weight: 600; }
        .nav-icon { display: flex; align-items: center; flex-shrink: 0; }
        .btn-logout { background: rgba(255,77,77,0.08); color: #ff7b78; border: 1px solid rgba(255,77,77,0.2); padding: 8px 12px; border-radius: 6px; font-size: 0.8rem; font-weight: 600; cursor: pointer; transition: background 0.2s; width: 100%; display: flex; align-items: center; justify-content: center; gap: 8px; margin-top: 10px; }
        .btn-logout:hover { background: rgba(255,77,77,0.15); }
        .user-profile-main { display: flex; align-items: center; gap: 10px; }
      `}</style>
    </>
  );
}
