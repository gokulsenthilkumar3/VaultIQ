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

      </body>
    </html>
  );
}
