import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import '../styles/globals.css';
import { AuthProvider } from '../context/AuthContext';
import Shell from '../components/Shell';
import FloatingAssistant from '../components/FloatingAssistant';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'VaultIQ — IT Asset Intelligence',
  description: 'Enterprise-grade IT asset lifecycle management with AI-powered maintenance forecasting.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <Shell>{children}</Shell>
          <FloatingAssistant />
        </AuthProvider>
      </body>
    </html>
  );
}
