import '../styles/globals.css';
import { Inter } from 'next/font/google';
import { AuthProvider } from '../context/AuthContext';
import FloatingAssistant from '../components/FloatingAssistant';
import Shell from '../components/Shell';

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
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <AuthProvider>
          <Shell>
            {children}
          </Shell>
          <FloatingAssistant />
        </AuthProvider>
      </body>
    </html>
  );
}
