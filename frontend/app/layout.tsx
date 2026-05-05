import '../styles/globals.css';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'AssetFlow | Enterprise Asset Management',
  description: 'Next-generation office asset tracking and management system.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="layout-wrapper">
          <aside className="sidebar glass">
            <div className="logo">
              <span className="logo-icon">▲</span>
              <span className="logo-text">AssetFlow</span>
            </div>
            <nav className="nav-menu">
              <a href="/dashboard" className="nav-item active">Dashboard</a>
              <a href="/inventory" className="nav-item">Inventory</a>
              <a href="/scanner" className="nav-item">Scanner</a>
              <a href="/maintenance" className="nav-item">Maintenance</a>
              <a href="/reports" className="nav-item">Reports</a>
            </nav>
            <div className="user-profile">
              <div className="avatar">JD</div>
              <div className="user-info">
                <p className="user-name">John Doe</p>
                <p className="user-role">Administrator</p>
              </div>
            </div>
          </aside>
          
          <main className="main-content">
            <header className="top-bar">
              <div className="search-box">
                <input type="text" placeholder="Search assets, tags, users..." className="glass" />
              </div>
              <div className="actions">
                <button className="btn btn-primary">+ Add Asset</button>
              </div>
            </header>
            <div className="content-area animate-fade-in">
              {children}
            </div>
          </main>
        </div>

        <style jsx global>{`
          .layout-wrapper {
            display: grid;
            grid-template-columns: 280px 1fr;
            min-height: 100vh;
          }

          .sidebar {
            padding: 32px;
            display: flex;
            flex-direction: column;
            border-right: 1px solid var(--border-color);
            position: sticky;
            top: 0;
            height: 100vh;
          }

          .logo {
            display: flex;
            align-items: center;
            gap: 12px;
            font-size: 1.5rem;
            font-weight: 800;
            margin-bottom: 48px;
            color: var(--accent-primary);
          }

          .nav-menu {
            flex: 1;
            display: flex;
            flex-direction: column;
            gap: 8px;
          }

          .nav-item {
            padding: 12px 16px;
            border-radius: 8px;
            text-decoration: none;
            color: var(--text-secondary);
            font-weight: 500;
            transition: all 0.2s ease;
          }

          .nav-item:hover, .nav-item.active {
            background: rgba(88, 166, 255, 0.1);
            color: var(--accent-primary);
          }

          .main-content {
            padding: 32px;
            background: radial-gradient(circle at top right, rgba(88, 166, 255, 0.05), transparent);
          }

          .top-bar {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 40px;
          }

          .search-box input {
            width: 400px;
            padding: 12px 20px;
            color: white;
            outline: none;
          }

          .user-profile {
            display: flex;
            align-items: center;
            gap: 12px;
            padding-top: 24px;
            border-top: 1px solid var(--border-color);
          }

          .avatar {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            background: var(--accent-secondary);
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 700;
            font-size: 0.8rem;
          }

          .user-name {
            font-size: 0.9rem;
            font-weight: 600;
          }

          .user-role {
            font-size: 0.75rem;
            color: var(--text-secondary);
          }
        `}</style>
      </body>
    </html>
  );
}
