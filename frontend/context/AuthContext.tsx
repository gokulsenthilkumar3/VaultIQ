'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { setAuthToken, clearAuthToken } from '../lib/api';

interface User {
  id: string;
  email: string;
  fullName: string;
  role: 'ADMIN' | 'MANAGER' | 'USER';
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string) => Promise<void>;
  logout: () => void;
}

// Mock users — works when backend is unreachable
// To use real backend: replace login() body with the apiFetch call
const MOCK_USERS: Record<string, User> = {
  'admin@company.com': { id: 'mock-1', email: 'admin@company.com', fullName: 'Admin User', role: 'ADMIN' },
  'manager@company.com': { id: 'mock-2', email: 'manager@company.com', fullName: 'Manager User', role: 'MANAGER' },
  'user@company.com': { id: 'mock-3', email: 'user@company.com', fullName: 'Regular User', role: 'USER' },
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => {},
  logout: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const storedUser = (window as any).__vaultiq_user;
    if (storedUser) {
      setUser(storedUser);
    }
    setLoading(false);
  }, []);

  const login = async (email: string) => {
    const mockUser = MOCK_USERS[email.toLowerCase().trim()];
    if (!mockUser) {
      throw new Error('Unknown email. Try admin@company.com, manager@company.com, or user@company.com');
    }
    const mockToken = 'mock-token-' + Date.now();
    setAuthToken(mockToken);
    (window as any).__vaultiq_user = mockUser;
    setUser(mockUser);
    router.push('/dashboard');
  };

  const logout = () => {
    clearAuthToken();
    delete (window as any).__vaultiq_user;
    setUser(null);
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
